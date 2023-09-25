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

  const file = path.slice(1);
  // https://nodejs.org/api/fs.html#class-fsstats
  const mtime = (await stat(file)).mtimeMs;
  // comparing dates is cheaper than checksum, but not as reliable
  if (cfg.cache && existingDocument && existingDocument.mtime === mtime) return;

  const markdown = await readFile(file, { encoding: "utf8" });
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
           * in future may be used
           * - to check if it returns <= 400
           * - to fetch icon
           * - to generate screenshot
           */
          return SKIP;
        }
      }

      let properties: JsonObject = {
        // for visualization
        from_id: newDocument.properties.id,
        // for link resolution
        type: node.type,
      };

      if (node.type === "link") {
        const label = node.children[0].value as string;
        let [to_url, to_anchor] = decodeURI(node.url).split("#");
        let to_path = to_url;
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
        properties = {
          ...properties,
          // for visualization
          label,
          // for link resolution
          to_url,
          to_path,
          to_anchor,
        };
      } else {
        const label = node.data.alias as string;
        const [to_slug, to_anchor] = node.value.split("#");
        properties = {
          ...properties,
          // for visualization
          label,
          // for link resolution
          to_slug,
          to_anchor,
        };
      }

      const start = node.position.start.offset as number;

      db.insert(link)
        .values({ from: path, ast: node, start, properties })
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
