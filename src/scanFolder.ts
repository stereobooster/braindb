import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { document, link } from "./schema";
import { JsonObject } from "./json";
import { mdParser } from "./parser";
import { getCheksum, getFiles, getUid, isExternalLink } from "./utils";
import { basename, dirname, resolve } from "node:path";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { eq } from "drizzle-orm";
import { readFile, stat } from "node:fs/promises";

export function scanFolder<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  pathToCrawl: string,
  cacheEnabled = true
) {
  const result = getFiles(pathToCrawl).map(async (file) => {
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
      // this needs to be more sophisticated
      db.delete(document).where(eq(document.path, path)).run();
      db.delete(link).where(eq(link.from, path)).run();
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
      }

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
            return;
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
          // resolve local link
          if (!to_url.startsWith("/")) {
            to_url = resolve(dirname(path), to_url);
          }
          // normalize url
          if (!to_url.endsWith("/") && !to_url.endsWith(".md")) {
            to_url = to_url + "/";
          }
          properties = {
            ...properties,
            // for visualization
            label,
            // for link resolution
            to_url,
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
      }

      // if (node.type === "heading") {
      //   console.log(slugger.slug(node.children[0].value));
      // }
    });

    // TODO: url generation function should come as config - takes frontmatter + path
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
  });

  return Promise.all(result);
}
