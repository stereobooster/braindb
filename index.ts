import { fdir } from "fdir";
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import remarkFrontmatter from "remark-frontmatter";
// https://github.com/remarkjs/remark-gfm#when-should-i-use-this
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import wikiLinkPlugin from "remark-wiki-link";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { createHash } from "node:crypto";
import { SQL, and, eq, isNotNull, isNull, sql } from "drizzle-orm";

import { document, link } from "./src/schema";
import { db } from "./src/db";
import { JsonObject } from "./src/json";
import { Graphviz } from "@hpcc-js/wasm/graphviz";

const graphviz = await Graphviz.load();

const pathToCrawl = "example";

// import type {Processor} from 'unified'
// import type {Root} from 'mdast'
const mdParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(wikiLinkPlugin, {
    hrefTemplate: (permalink) => permalink,
    pageResolver: (name) => [name.replace(/ /g, "%20").toLowerCase()],
    aliasDivider: "|",
    wikiLinkClassName: " ",
    newClassName: " ",
  })
  .use(remarkRehype, { allowDangerousHtml: true, fragment: true })
  .use(rehypeSlug);

const slugger = new GithubSlugger();

const crawler = new fdir()
  .withBasePath()
  .filter((path, _isDirectory) => path.endsWith(".md"));
const files = crawler.crawl(pathToCrawl).sync();
const basePathRegexp = RegExp(`^${pathToCrawl}`);
const externalLinkRegexp = RegExp(`^[a-z]+://`);

// https://github.com/Cyan4973/xxHash
const getCheksum = (str: string) =>
  createHash("md5").update(str, "utf8").digest("base64url");
// can as well use random id or autoincrement
const getId = (str: string) =>
  "n" + getCheksum(str).replace("-", "").slice(0, 5);

const result = files.map(async (file) => {
  const filePath = new URL(file, import.meta.url);
  const path = file.replace(basePathRegexp, "");
  const markdown = await readFile(filePath, { encoding: "utf8" });
  const existingFile = db
    .select({ path: document.path, checksum: document.checksum })
    .from(document)
    .where(eq(document.path, path))
    .all();

  const checksum = getCheksum(markdown);
  if (existingFile.length > 0) {
    if (existingFile[0].checksum === checksum) return;
    // this needs to be more sophisticated
    db.delete(document).where(eq(document.path, path)).run();
    db.delete(link).where(eq(link.from, path)).run();
  }

  const id = getId(path);
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
  };
  db.insert(document)
    .values({ path, ...data })
    .onConflictDoUpdate({ target: document.path, set: data })
    .run();
});

await Promise.all(result);

/**
 * Primitive way to resolve links
 * Better way would be to use JOIN to find all matches and separately report unmatched links
 */
const links = db.select().from(link).where(isNull(link.to)).all();
links.forEach((newLink) => {
  let where: SQL;

  if (newLink.properties.type === "wikiLink") {
    const slug = newLink.properties.to_slug as string;
    where = eq(document.slug, slug);
  } else {
    const url = newLink.properties.to_url as string;
    where = url.endsWith(".md")
      ? eq(document.path, url)
      : eq(document.url, url);
  }

  const matchedDcouments = db
    .select({
      path: document.path,
      id: sql<string>`json_extract(${document.properties}, '$.id')`,
    })
    .from(document)
    .where(where)
    .all();

  if (matchedDcouments.length === 1) {
    // resolution: ok
    db.update(link)
      .set({
        to: matchedDcouments[0].path,
        properties: { ...newLink.properties, to_id: matchedDcouments[0].id },
      })
      .where(and(eq(link.from, newLink.from), eq(link.start, newLink.start)))
      .run();
  } else if (matchedDcouments.length === 0) {
    // resolution: broken
    // TODO: test
    console.log(`${newLink.properties.type}: broken`);
  } else {
    // resolution: ambiguous
    // TODO: test
    console.log(`${newLink.properties.type}: ambiguous`);
  }
});

const edges = db
  .select({
    from_id: sql<string>`json_extract(${link.properties}, '$.from_id')`,
    to_id: sql<string>`json_extract(${link.properties}, '$.to_id')`,
  })
  .from(link)
  // need to show broken links on the graph
  .where(isNotNull(link.to))
  .all();

const nodes = db
  .select({
    id: sql<string>`json_extract(${document.properties}, '$.id')`,
    title: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
    url: document.url,
  })
  .from(document)
  .all();

const dot = `digraph G {
bgcolor=transparent;

${nodes
  .map((node) => `${node.id} [label="${node.title}",href="${node.url}"];`)
  .join("\n")}

${edges
  .map(
    (edge) => `${edge.from_id} -> ${edge.to_id};` /* [label="${edge.label}"]; */
  )
  .join("\n")}
}`;

// https://graphviz.org/docs/layouts/
const svg = graphviz.layout(dot, "svg", "fdp");
const svgPath = new URL("tmp/graph.svg", import.meta.url);
await writeFile(svgPath, svg, { encoding: "utf8" });
