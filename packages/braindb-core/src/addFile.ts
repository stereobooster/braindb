import { readFile, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
// import GithubSlugger from "github-slugger";
import { type Node } from "unist";

import { document, link } from "./schema";
import { JsonObject } from "./types";
import { mdParser } from "./parser";
import { getCheksum, getUid, isExternalLink } from "./utils";
import { deleteFile } from "./deleteFile";
import { Db } from "./db";
import { BrainDBOptions } from "../index";

export async function addFile(db: Db, path: string, cfg: BrainDBOptions) {
  // maybe use prepared statement?
  const [existingDocument] = db
    .select({
      path: document.path,
      checksum: document.checksum,
      mtime: document.mtime,
      url: document.url,
      slug: document.slug,
    })
    .from(document)
    .where(eq(document.path, path))
    .all();

  // https://nodejs.org/api/fs.html#class-fsstats
  const mtime = (await stat(cfg.source + path)).mtimeMs;
  // comparing dates is cheaper than checksum, but not as reliable
  if (cfg.cache && existingDocument && existingDocument.mtime === mtime) return;

  const markdown = await readFile(cfg.source + path, { encoding: "utf8" });
  const checksum = getCheksum(markdown);
  if (cfg.cache && existingDocument && existingDocument.checksum === checksum)
    return;

  const ast = await mdParser.parse(markdown);

  // typeof document.$inferInsert
  const newDocument = {
    ...processFile(ast, path),
    path,
    ast,
    markdown,
    checksum,
    mtime,
    url: "",
  };

  if (cfg.generateUrl) {
    newDocument.url = cfg.generateUrl(path, newDocument.frontmatter);
  }

  if (existingDocument) deleteFile(db, path);

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
        label = node.children[0].value as string;
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
          to_path = resolve(dirname(path), to_path);
        }
      } else {
        label = node.data.alias as string;
        [to_slug, to_anchor] = node.value.split("#");
      }

      const start = node.position.start.offset as number;
      const from_id = newDocument.properties.id;

      db.insert(link)
        .values({
          from: path,
          start,
          properties: {},
          from_id,
          to_url,
          to_path,
          to_slug,
          to_anchor,
          label,
        })
        .run();

      return SKIP;
    }

    // if (node.type === "heading") {
    //   console.log(slugger.slug(node.children[0].value));
    //   return SKIP;
    // }
  });
}

/**
 * Extracts frontmatter, slug, url
 */
export function processFile(ast: Node, path: string) {
  let frontmatter: JsonObject = {};
  visit(ast as any, (node) => {
    if (node.type === "yaml") {
      /**
       * can yaml handle none-JSON types?
       * if yes, than this is a bug
       */
      frontmatter = parseYaml(node.value);
      return EXIT;
    }
  });

  let slug: string;
  if (frontmatter.slug) {
    // no validation - trusting source
    slug = String(frontmatter.slug);
  } else {
    slug = basename(path.replace(/_?index\.md$/, ""), ".md") || "/";
  }

  if (!frontmatter.title) frontmatter.title = slug;

  return {
    frontmatter,
    slug,
    properties: { id: getUid() },
  };
}
