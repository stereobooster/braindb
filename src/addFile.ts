import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { readFile, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
// import GithubSlugger from "github-slugger";

import { document, link } from "./schema";
import { JsonObject } from "./json";
import { mdParser } from "./parser";
import { getCheksum, getUid, isExternalLink } from "./utils";
import { removeFile } from "./removeFile";

// TODO: `generateUrl` - function to resolve url path based on frontmatter
export async function addFile<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  file: string,
  cacheEnabled = true
) {
  const path = "/" + file;
  // maybe use prepared statement?
  const existingFile = db
    .select({
      path: document.path,
      checksum: document.checksum,
      mtime: document.mtime,
    })
    .from(document)
    .where(eq(document.path, path))
    .all();

  // https://nodejs.org/api/fs.html#class-fsstats
  const mtime = (await stat(file)).mtimeMs;
  // comparing dates is cheaper than checksum, but not as reliable
  if (
    cacheEnabled &&
    existingFile.length > 0 &&
    existingFile[0].mtime === mtime
  )
    return;

  const markdown = await readFile(file, { encoding: "utf8" });
  const checksum = getCheksum(markdown);
  if (
    cacheEnabled &&
    existingFile.length > 0 &&
    existingFile[0].checksum === checksum
  )
    return;

  if (existingFile.length > 0) {
    removeFile(db, file);
  }

  const id = getUid();
  const ast = await mdParser.parse(markdown);

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

  // this should be done in `generateUrl`
  let url: string;
  let slug: string;
  if (frontmatter.slug) {
    // no validation - trusting source
    slug = String(frontmatter.slug);
    url = path + "/" + slug + "/";
    // } else if (frontmatter.url) {
    //   slug = basename(String(frontmatter.url));
    //   url = String(frontmatter.url);
    //   if (!url.startsWith("/")) url = "/" + url;
    //   if (!url.endsWith("/")) url = url + "/";
  } else {
    slug = basename(path.replace(/_?index\.md$/, ""), ".md") || "/";
    url = path.replace(/_?index\.md$/, "").replace(/\.md$/, "") || "/";
    if (!url.endsWith("/")) url = url + "/";
  }

  if (!frontmatter.title) frontmatter.title = slug;

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
        from_id: id,
        // for link resolution
        type: node.type,
      };

      if (node.type === "link") {
        const label = node.children[0].value as string;
        let [to_url, to_anchor] = decodeURI(node.url).split("#");
        let to_path = to_url;
        // resolve local link
        if (!to_url.startsWith("/")) {
          to_url = resolve(url, to_url);
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

  const properties = {
    id,
  };
  const data = {
    frontmatter,
    slug,
    url,
    markdown,
    ast,
    checksum,
    properties,
    mtime,
  };
  db.insert(document)
    .values({ path, ...data })
    .onConflictDoUpdate({ target: document.path, set: data })
    .run();
}
