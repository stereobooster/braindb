import { fdir } from "fdir";
import { readFile } from "node:fs/promises";
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
import { and, eq, isNull } from "drizzle-orm";

import { documents, links } from "./src/schema";
import { db } from "./src/db";
import { JsonObject } from "./src/json";

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

const result = files.map(async (file) => {
  const filePath = new URL(file, import.meta.url);
  const path = file.replace(basePathRegexp, "");
  const markdown = await readFile(filePath, { encoding: "utf8" });
  // check if item already in DB
  // - if not proceed
  // - if yes and the same checksum - skip
  // - if yes but different checksum - delete old links and proceed

  // https://github.com/Cyan4973/xxHash
  const checksum = createHash("md5").update(markdown, "utf8").digest("hex");
  db.delete(documents).where(eq(documents.path, path)).run();
  db.delete(links).where(eq(links.from, path)).run();

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
      db.insert(links).values({ from: path, ast: node, start }).run();
    }
    if (node.type === "wikiLink") {
      const start = node.position.start.offset as number;
      db.insert(links).values({ from: path, ast: node, start }).run();
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

  const data = { frontmatter, slug, url, markdown, ast, checksum };
  db.insert(documents)
    .values({ path, ...data })
    .onConflictDoUpdate({ target: documents.path, set: data })
    .run();
});

await Promise.all(result);

/**
 * Primitive way to resolve links
 * Better way would be to use JOIN to find all matches and separately report unmatched links
 */
const linksToProcess = db.select().from(links).where(isNull(links.to)).all();
linksToProcess.forEach((link) => {
  const ast = link.ast as JsonObject;

  const from = link.from as string;
  if (ast.type === "wikiLink") {
    const value = ast.value as string;
    const [slug, anchor] = value.split("#");
    const result = db
      .select({ path: documents.path })
      .from(documents)
      .where(eq(documents.slug, slug))
      .all();

    if (result.length === 1) {
      db.update(links)
        .set({ to: result[0].path })
        .where(and(eq(links.from, link.from), eq(links.from, link.from)))
        .run();
    } else if (result.length === 0) {
      console.log("wikiLink: broken");
    } else {
      console.log("wikiLink: ambiguous");
    }
  }
  if (ast.type === "link") {
    const url = ast.url as string;

    let [urlWithoutAnchor, anchor] = decodeURI(url).split("#");
    if (!urlWithoutAnchor.startsWith("/")) {
      // resoolve relative path
      urlWithoutAnchor = resolve(dirname(from), urlWithoutAnchor);
    }

    if (!urlWithoutAnchor.endsWith(".md") && !urlWithoutAnchor.endsWith("/")) {
      urlWithoutAnchor = urlWithoutAnchor + "/";
    }

    const result = db
      .select({ path: documents.path })
      .from(documents)
      .where(
        urlWithoutAnchor.endsWith(".md")
          ? eq(documents.path, urlWithoutAnchor)
          : eq(documents.url, urlWithoutAnchor)
      )
      .all();

    if (result.length === 1) {
      db.update(links)
        .set({ to: result[0].path })
        .where(and(eq(links.from, link.from), eq(links.from, link.from)))
        .run();
    } else if (result.length === 0) {
      console.log("link: broken");
    } else {
      console.log("link: ambiguous");
    }
  }
});

console.log(db.select({ from: links.from, to: links.to }).from(links).all());

// console.log(
//   db
//     .select({ slug: documents.slug, path: documents.path, url: documents.url })
//     .from(documents)
//     .all()
// );
