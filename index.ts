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
import { and, eq, isNotNull, isNull } from "drizzle-orm";

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
    /**
     * Options for id for link:
     * - autoincrement
     * - uuid-like (random)
     * - path + start.offset
     * - path + start.column + start.line
     */
    if (node.type === "link") {
      const url = encodeURI(node.url);
      if (externalLinkRegexp.test(url)) {
        /**
         * not interested in external links for now
         * in future may be used
         * - to check if it returns <= 400
         * - to fetch icon
         * - to generate screenshot
         */
        return;
      }
      const start = node.position.start.offset as number;
      const label = node.children[0].value as string;
      // TODO: to_link (either URL (URLEncode?) or relative path), to_anchor
      db.insert(link)
        .values({ from: path, from_id: id, ast: node, start, label })
        .run();
    }
    if (node.type === "wikiLink") {
      const start = node.position.start.offset as number;
      const label = node.data.alias as string;
      // TODO: to_slug, to_anchor
      db.insert(link)
        .values({ from: path, from_id: id, ast: node, start, label })
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

  if (!frontmatter.title) {
    frontmatter.title = slug;
  }

  const data = { id, frontmatter, slug, url, markdown, ast, checksum };
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
  const ast = newLink.ast as JsonObject;

  const from = newLink.from as string;
  if (ast.type === "wikiLink") {
    const value = ast.value as string;
    const [slug, anchor] = value.split("#");
    const result = db
      .select({ path: document.path, id: document.id })
      .from(document)
      .where(eq(document.slug, slug))
      .all();

    if (result.length === 1) {
      db.update(link)
        .set({ to: result[0].path, to_id: result[0].id })
        .where(and(eq(link.from, newLink.from), eq(link.start, newLink.start)))
        .run();
    } else if (result.length === 0) {
      // TODO: test
      console.log("wikiLink: broken");
    } else {
      // TODO: test
      console.log("wikiLink: ambiguous");
    }
  }
  if (ast.type === "link") {
    const url = ast.url as string;

    let [urlWithoutAnchor, anchor] = decodeURI(url).split("#");
    if (!urlWithoutAnchor.startsWith("/")) {
      // resolve relative path
      urlWithoutAnchor = resolve(dirname(from), urlWithoutAnchor)
    }

    if (!urlWithoutAnchor.endsWith(".md") && !urlWithoutAnchor.endsWith("/")) {
      urlWithoutAnchor = urlWithoutAnchor + "/";
    }

    const result = db
      .select({ path: document.path, id: document.id })
      .from(document)
      .where(
        urlWithoutAnchor.endsWith(".md")
          ? eq(document.path, urlWithoutAnchor)
          : eq(document.url, urlWithoutAnchor)
      )
      .all();

    if (result.length === 1) {
      db.update(link)
        .set({ to: result[0].path, to_id: result[0].id })
        .where(and(eq(link.from, newLink.from), eq(link.start, newLink.start)))
        .run();
    } else if (result.length === 0) {
      // TODO: test
      console.log("link: broken");
    } else {
      // TODO: test
      console.log("link: ambiguous");
    }
  }
});

const edges = db
  .select({
    from_id: link.from_id,
    to_id: link.to_id,
    label: link.label,
  })
  .from(link)
  // need to show broken links on the graph
  .where(isNotNull(link.to_id))
  .all();

const nodes = db
  .select({
    id: document.id,
    url: document.url,
    // how to use SQLite's `json_extract('$.title', frontmatter)`?
    frontmatter: document.frontmatter,
  })
  .from(document)
  .all()
  .map((node) => {
    const frontmatter = node.frontmatter as JsonObject;
    return {
      id: node.id,
      url: node.url,
      title: frontmatter.title as string,
    };
  });

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
