import { fdir } from "fdir";
import { readFile, writeFile, stat } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import wikiLinkPlugin from "remark-wiki-link";
import remarkStringify from "remark-stringify";
// https://github.com/remarkjs/remark-gfm#when-should-i-use-this
// import remarkGfm from "remark-gfm";
// import remarkRehype from "remark-rehype";
// import rehypeSlug from "rehype-slug";
// import GithubSlugger from "github-slugger";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";

import { document, link } from "./src/schema";
import { db } from "./src/db";
import { JsonObject } from "./src/json";
import { toSvg } from "./src/graphVisualization";

const pathToCrawl = "example";

// import type {Processor} from 'unified'
// import type {Root} from 'mdast'
const mdParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  // .use(remarkGfm)
  .use(wikiLinkPlugin, {
    hrefTemplate: (permalink) => permalink,
    pageResolver: (name) => [name.replace(/ /g, "%20").toLowerCase()],
    aliasDivider: "|",
    wikiLinkClassName: " ",
    newClassName: " ",
  })
  // .use(remarkRehype, { allowDangerousHtml: true, fragment: true })
  // .use(rehypeSlug)
  .use(remarkStringify, { resourceLink: false });

// const slugger = new GithubSlugger();

// TODO: is there way to skip scanning folders if mtime didn't change?
const crawler = new fdir()
  .withBasePath()
  .filter((path, _isDirectory) => path.endsWith(".md"));
const files = crawler.crawl(pathToCrawl).sync();
const basePathRegexp = RegExp(`^${pathToCrawl}`);
const externalLinkRegexp = RegExp(`^[a-z]+://`);

// https://github.com/Cyan4973/xxHash
const getCheksum = (str: string) =>
  createHash("md5").update(str, "utf8").digest("base64url");

// https://github.com/juanelas/bigint-crypto-utils/blob/main/src/ts/randBetween.ts
// it should be of length 26
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
const getUid = () =>
  "n" + randomBytes(128).readBigInt64BE().toString(36).replace("-", "");

const cacheEnabled = false;
let changedFiles = 0;
const result = files.map(async (file) => {
  const filePath = new URL(file, import.meta.url);
  const path = file.replace(basePathRegexp, "");
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
  const mtime = (await stat(filePath)).mtimeMs;
  // comparing dates is cheaper than checksum, but not as reliable
  if (
    cacheEnabled &&
    existingFile.length > 0 &&
    existingFile[0].mtime === mtime
  )
    return;

  const markdown = await readFile(filePath, { encoding: "utf8" });
  const checksum = getCheksum(markdown);
  if (
    cacheEnabled &&
    existingFile.length > 0 &&
    existingFile[0].checksum === checksum
  )
    return;

  changedFiles++;

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
        if (externalLinkRegexp.test(node.url)) {
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
        let [to_url, to_anchor] = node.url.split("#");
        if (!to_url.startsWith("/")) {
          // resolve relative path
          to_url = resolve(dirname(path), to_url);
        }
        if (!to_url.endsWith(".md") && !to_url.endsWith("/")) {
          to_url = to_url + "/";
        }
        if (to_url.endsWith(".md")) {
          to_url = decodeURI(to_url);
        }
        // shall I encodeURI web links?
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

  /**
   * For Obsidian:
   * - frontmatter is optional
   * - it uses filename as unique identifiers
   * For Hugo:
   * - it uses filename, but it's not unique becuase can be in different folders
   * - one can specify `slug` in frontmatter
   * - `index.md` and `_index.md` are special cases
   * - not taken into account for now:
   *   - one can specify `url` in frontmatter
   *   - path may contain [date and other things](https://gohugo.io/content-management/urls/#tokens)
   *   - path may end with `.html`
   *   - path may be lowercased or slugified
   *   - aliases
   */
  let url: string;
  let slug: string;
  if (frontmatter.slug) {
    // no validation - trusting source
    slug = String(frontmatter.slug);
    url = encodeURI(dirname(path) + "/" + slug + "/");
    // } else if (frontmatter.url) {
    //   slug = basename(String(frontmatter.url));
    //   url = encodeURI(String(frontmatter.url));
    //   if (!url.startsWith("/")) url = "/" + url;
    //   if (!url.endsWith("/")) url = url + "/";
  } else {
    slug = basename(path.replace(/_?index\.md$/, ""), ".md") || "/";
    url =
      encodeURI(path.replace(/_?index\.md$/, "").replace(/\.md$/, "/")) || "/";
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

await Promise.all(result);

if (changedFiles > 0) {
  // TODO: mayby use separate columns with indexes instead of JSON?
  // TODO: check for abiguous links
  // Maybe update would be better than replace?
  db.run(
    sql`
  REPLACE INTO links
  SELECT "from", path as "to", "start", 
      json_set(links.properties, '$.to_id', json_extract(documents.properties, '$.id')) as properties,
      links.ast as "ast"
  FROM links INNER JOIN documents ON
      json_extract(links.properties, '$.to_slug') = documents.slug OR
      json_extract(links.properties, '$.to_url') = documents.url OR
      json_extract(links.properties, '$.to_url') = documents.path
  WHERE links."to" IS NULL;`
  );
}

// TODO: report unresolved links

const svgPath = new URL("tmp/graph.svg", import.meta.url);
await writeFile(svgPath, toSvg(db), { encoding: "utf8" });

import { map } from "unist-util-map";

db.select()
  .from(document)
  .all()
  .forEach((d) => {
    const modified = map(d.ast as any, (node) => {
      if (node.type == "wikiLink") {
        // console.log(node);
        const [resolvedLink] = db
          .select()
          .from(link)
          .where(
            and(
              eq(link.from, d.path),
              eq(link.start, node.position.start.offset)
            )
          )
          .all();

        if (!resolvedLink) {
          // TODO: handle not resolved links
          return node;
        }

        let url = "";
        if (resolvedLink.to) {
          url = resolvedLink.to;
          if (resolvedLink.properties.to_anchor) {
            url = url + "#" + resolvedLink.properties.to_anchor;
          }
          url= encodeURI(url);
        }

        const newNode = {
          type: "link",
          title: null,
          url,
          children: [
            {
              type: "text",
              value: node.data.alias,
            },
          ],
        };
        return newNode;
      }
      return node;
    });
    // TODO: insert or update frontmatter
    console.log(d.path);
    console.log(mdParser.stringify(modified));
  });
