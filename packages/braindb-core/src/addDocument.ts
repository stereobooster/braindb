import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
// import GithubSlugger from "github-slugger";
import { type Node } from "unist";

import { document, link } from "./schema.js";
import { JsonObject } from "./types.js";
import { mdParser } from "./parser.js";
import { getCheksum, getUid, isExternalLink } from "./utils.js";
import { deleteDocument } from "./deleteDocument.js";
import { Db } from "./db.js";
import { BrainDBOptionsIn } from "./index.js";
import { getSlug, getUrl } from "./defaults.js";

export async function addDocument(db: Db, idPath: string, cfg: BrainDBOptionsIn) {
  // maybe use prepared statement?
  const [existingDocument] = db
    .select({
      path: document.path,
      checksum: document.checksum,
      mtime: document.mtime,
    })
    .from(document)
    .where(eq(document.path, idPath))
    .all();

  let mtime = 0;
  let checksum = "";
  let markdown = "";
  const absolutePath = cfg.root + idPath;

  if (cfg.cache) {
    // https://nodejs.org/api/fs.html#class-fsstats
    mtime = (await stat(absolutePath)).mtimeMs;
    // comparing dates is cheaper than checksum, but not as reliable
    if (existingDocument && existingDocument.mtime === mtime) return;

    markdown = await readFile(absolutePath, { encoding: "utf8" });
    checksum = getCheksum(markdown);
    if (existingDocument && existingDocument.checksum === checksum) return;
  } else {
    markdown = await readFile(absolutePath, { encoding: "utf8" });
  }

  const ast = await mdParser.parse(markdown);
  const frontmatter = getFrontmatter(ast);

  // typeof document.$inferInsert
  const newDocument = {
    frontmatter,
    // TODO: make id autoicnrement and move out of properties
    properties: { id: getUid() },
    path: idPath,
    ast,
    markdown,
    checksum,
    mtime,
    url: cfg.url ? cfg.url(idPath, frontmatter) : getUrl(idPath, frontmatter),
    slug: cfg.slug ? cfg.slug(idPath, frontmatter) : getSlug(idPath, frontmatter),
  };

  if (existingDocument) deleteDocument(db, idPath);

  // TODO: should not update frontmatter here,
  // but title may be exception (or not?), because it is required for wikilinks
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
          to_path = resolve(dirname(idPath), to_path);
        }
      } else {
        label = node.data.alias as string;
        [to_slug, to_anchor] = node.value.split("#");
      }

      const start = node.position.start.offset as number;
      const from_id = newDocument.properties.id;

      db.insert(link)
        .values({
          from: idPath,
          start,
          properties: {},
          // TODO: remove ids from link
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