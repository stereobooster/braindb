import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
import type { Node } from "unist";

import { file, link, task } from "./schema.js";
import { JsonObject } from "./types.js";
import { mdParser } from "./parser.js";
import {
  cheksum32,
  cheksumConfig,
  isExternalLink,
  memoizeOnce,
} from "./utils.js";
import { deleteFile } from "./queries.js";
import { Db } from "./db.js";
import { BrainDBOptionsIn } from "./index.js";
import { defaultGetSlug, defaultGetUrl } from "./defaults.js";
import { Repository } from "@napi-rs/simple-git";
import path from "node:path";

export const emptyAst: Node = {} as any;

const getRepo = memoizeOnce((path: string) => Repository.discover(path));
const getRepoPath = memoizeOnce((repo: Repository) => dirname(repo.path()));

export async function addFile(
  db: Db,
  idPath: string,
  cfg: BrainDBOptionsIn,
  revision: number
) {
  // maybe use prepared statement?
  const [existingFile] = db
    .select({
      id: file.id,
      path: file.path,
      mtime: file.mtime,
      checksum: file.checksum,
      cfghash: file.cfghash,
    })
    .from(file)
    .where(eq(file.path, idPath))
    .all();
  const { ext, name } = path.parse(idPath);

  const absolutePath = cfg.root + idPath;
  // https://nodejs.org/api/fs.html#class-fsstats
  const st = await stat(absolutePath);
  const mtime = st.mtimeMs;
  let checksum = 0;
  let content: Buffer | null = null;
  let cfghash = 0;

  if (cfg.cache) {
    cfghash = cheksumConfig(cfg);
    // https://ziglang.org/download/0.4.0/release-notes.html#Build-Artifact-Caching
    const trustedTimestamp =
      existingFile && Math.abs(existingFile.mtime - Date.now()) > 1000;
    if (
      existingFile &&
      trustedTimestamp &&
      existingFile.cfghash === cfghash &&
      existingFile.mtime === mtime
    ) {
      await db
        .update(file)
        .set({ revision /*, updated_at */ })
        .where(eq(file.path, idPath));
      return;
    }

    content = await readFile(absolutePath);
    checksum = cheksum32(content);
    if (
      existingFile &&
      existingFile.cfghash === cfghash &&
      existingFile.checksum === checksum
    ) {
      await db
        .update(file)
        .set({ revision /*, updated_at */ })
        .where(eq(file.path, idPath));
      return;
    }
  } else {
    content = await readFile(absolutePath);
  }

  let updated_at = Math.round(mtime);
  if (cfg.git) {
    // TODO: maybe, if file is modified use `mtimeMs` instead of git date?
    try {
      const repo = getRepo(cfg.root);
      updated_at = await repo.getFileLatestModifiedDateAsync(
        absolutePath.replace(getRepoPath(repo) + "/", "")
      );
    } catch (e) {
      // TODO: maybe config logger?
      // TODO: use LRU or Bloom filter to report warning only once
      console.log(`Warning: ${e}`);
    }
  }

  let ast = emptyAst;
  let data: JsonObject = {};
  let type: string | null = null;
  // TODO: get this data from "plugin"
  if (ext === ".md" || ext === ".mdx") {
    ast = mdParser.parse(content.toString("utf8"));
    data = getFrontmatter(ast);
    if (!data.title) data.title = name;
    type = "markdown";
  }

  const getUrl = cfg.url || defaultGetUrl;
  const getSlug = cfg.slug || defaultGetSlug;

  const newFile = {
    id: existingFile?.id,
    data: data,
    path: idPath,
    ast: cfg.storeMarkdown === false ? emptyAst : ast,
    mtime,
    checksum,
    cfghash,
    url: getUrl(idPath, data),
    slug: getSlug(idPath, data),
    updated_at,
    revision,
    type,
  } satisfies typeof file.$inferInsert;

  if (existingFile) deleteFile(db, idPath);

  db.insert(file)
    .values(newFile)
    .onConflictDoUpdate({ target: file.path, set: newFile })
    .run();

  if (ext !== ".md" && ext !== ".mdx") return;

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

      let target_url, target_path, target_slug, target_anchor;

      if (node.type === "link") {
        // label = node.children[0]?.value as string;
        [target_url, target_anchor] = decodeURI(node.url).split("#");
        target_path = target_url;
        // resolve local link
        if (!target_url.startsWith("/")) {
          target_url = resolve(newFile.url, target_url);
        }
        // normalize url
        if (!target_url.endsWith("/")) {
          target_url = target_url + "/";
        }
        // resolve local path
        if (!target_path.startsWith("/")) {
          target_path = resolve(dirname(idPath), target_path);
        }
      } else {
        // label = node.data.alias as string;
        [target_slug, target_anchor] = node.value.split("#");
      }

      const start = node.position.start.offset as number;
      const line = node.position.start.line as number;
      const column = node.position.start.column as number;

      db.insert(link)
        .values({
          source: idPath,
          start,
          target_url,
          target_path,
          target_slug,
          target_anchor,
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
          source: idPath,
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
  // What about ast.data.matter?
  // https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
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
