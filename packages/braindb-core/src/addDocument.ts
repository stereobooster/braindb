import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
import type { Node } from "unist";

import { document, link, task } from "./schema.js";
import { JsonObject } from "./types.js";
import { mdParser } from "./parser.js";
import {
  cheksum64str,
  cheksumConfig,
  isExternalLink,
  memoizeOnce,
} from "./utils.js";
import { deleteDocument } from "./deleteDocument.js";
import { Db } from "./db.js";
import { BrainDBOptionsIn } from "./index.js";
import { defaultGetSlug, defaultGetUrl } from "./defaults.js";
import { Repository } from "@napi-rs/simple-git";

export const emptyAst = {};

const getRepo = memoizeOnce((path: string) => Repository.discover(path));

export async function addDocument(
  db: Db,
  idPath: string,
  cfg: BrainDBOptionsIn,
  revision: number
) {
  // maybe use prepared statement?
  const [existingDocument] = db
    .select({
      id: document.id,
      path: document.path,
      mtime: document.mtime,
      checksum: document.checksum,
      cfghash: document.cfghash,
    })
    .from(document)
    .where(eq(document.path, idPath))
    .all();

  const absolutePath = cfg.root + idPath;
  // https://nodejs.org/api/fs.html#class-fsstats
  const st = await stat(absolutePath);
  const mtime = st.mtimeMs;
  let checksum = "";
  let markdown = "";
  let cfghash = 0;

  if (cfg.cache) {
    cfghash = cheksumConfig(cfg);
    // https://ziglang.org/download/0.4.0/release-notes.html#Build-Artifact-Caching
    const trustedTimestamp =
      existingDocument && Math.abs(existingDocument.mtime - Date.now()) > 1000;
    if (
      existingDocument &&
      trustedTimestamp &&
      existingDocument.cfghash === cfghash &&
      existingDocument.mtime === mtime
    ) {
      await db
        .update(document)
        .set({ revision /*, updated_at */ })
        .where(eq(document.path, idPath));
      return;
    }

    markdown = await readFile(absolutePath, { encoding: "utf8" });
    checksum = cheksum64str(markdown);
    if (
      existingDocument &&
      existingDocument.cfghash === cfghash &&
      existingDocument.checksum === checksum
    ) {
      await db
        .update(document)
        .set({ revision /*, updated_at */ })
        .where(eq(document.path, idPath));
      return;
    }
  } else {
    markdown = await readFile(absolutePath, { encoding: "utf8" });
  }

  let updated_at = Math.round(mtime);
  if (cfg.git) {
    // TODO: maybe, if file is modified use `mtimeMs` instead of git date?
    try {
      if (cfg.git === true) {
        const repo = getRepo(cfg.root);
        updated_at = await repo.getFileLatestModifiedDateAsync(
          idPath.replace("/", "")
        );
      } else {
        const repo = getRepo(cfg.git);
        updated_at = await repo.getFileLatestModifiedDateAsync(
          absolutePath.replace(cfg.git + "/", "")
        );
      }
    } catch (e) {
      // TODO: maybe config logger?
      // TODO: use LRU of Bloom filter to report warning only once
      console.log(`Warning: ${e}`);
    }
  }

  const ast = mdParser.parse(markdown);
  markdown = "";
  const frontmatter = getFrontmatter(ast);
  const getUrl = cfg.url || defaultGetUrl;
  const getSlug = cfg.slug || defaultGetSlug;

  // typeof document.$inferInsert
  const newDocument = {
    id: existingDocument?.id,
    frontmatter,
    path: idPath,
    ast: cfg.storeMarkdown === false ? emptyAst : ast,
    mtime,
    checksum,
    cfghash,
    url: getUrl(idPath, frontmatter),
    slug: getSlug(idPath, frontmatter),
    updated_at,
    revision,
  };

  if (existingDocument) deleteDocument(db, idPath);

  // TODO: should not update frontmatter here,
  // but title may be exception (or not?), because it is required for wikilinks
  // Alternatively: can use first H1 as title
  if (!newDocument.frontmatter.title)
    newDocument.frontmatter.title = newDocument.slug;

  db.insert(document)
    .values(newDocument)
    .onConflictDoUpdate({ target: document.path, set: newDocument })
    .run();

  visit(ast as any, (node) => {
    if (node.type === "link" || node.type === "wikiLink") {
      if (node.type === "link") {
        if (isExternalLink(node.url)) {
          /**
           * not interested in external links for now
           * in future may be used:
           * - to check if it returns <= 400
           * - to fetch icon
           * - to generate screenshot
           */
          return SKIP;
        }
      }

      let to_url, to_path, to_slug, to_anchor, label;

      if (node.type === "link") {
        label = node.children[0]?.value as string;
        [to_url, to_anchor] = decodeURI(node.url).split("#");
        to_path = to_url;
        // resolve local link
        if (!to_url.startsWith("/")) {
          to_url = resolve(newDocument.url, to_url);
        }
        // normalize url
        if (!to_url.endsWith("/")) {
          to_url = to_url + "/";
        }
        // resolve local path
        if (!to_path.startsWith("/")) {
          to_path = resolve(dirname(idPath), to_path);
        }
      } else {
        label = node.data.alias as string;
        [to_slug, to_anchor] = node.value.split("#");
      }

      const start = node.position.start.offset as number;
      const line = node.position.start.line as number;
      const column = node.position.start.column as number;

      db.insert(link)
        .values({
          from: idPath,
          start,
          to_url,
          to_path,
          to_slug,
          to_anchor,
          label,
          line,
          column,
        })
        .run();

      return SKIP;
    }

    if (
      node.type === "listItem" &&
      (node.checked === true || node.checked === false)
    ) {
      const start = node.position.start.offset as number;
      const line = node.position.start.line as number;
      const column = node.position.start.column as number;
      const checked = node.checked;
      const ast = node.children[0];

      db.insert(task)
        .values({
          from: idPath,
          start,
          line,
          column,
          checked,
          ast,
        })
        .run();

      return SKIP;
    }

    // if (node.type === "heading") {
    //   return SKIP;
    // }
  });
}

export function getFrontmatter(ast: Node) {
  let frontmatter: JsonObject = {};
  visit(ast as any, (node) => {
    if (node.type === "yaml") {
      /**
       * can yaml handle none-JSON types? if yes, than this is a bug
       */
      frontmatter = parseYaml(node.value);
      return EXIT;
    }
  });
  return frontmatter;
}
