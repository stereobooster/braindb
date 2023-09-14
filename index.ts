import { fdir } from "fdir";
import { readFile } from "node:fs/promises";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import wikiLinkPlugin from "remark-wiki-link";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";
import { createHash } from "node:crypto";

import { documents, links } from "./src/schema";
import { db } from "./src/db";
import { eq } from "drizzle-orm";

// import type {Processor} from 'unified'
// import type {Root} from 'mdast'
const mdParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(remarkGfm)
  .use(wikiLinkPlugin, {
    hrefTemplate: (permalink) => permalink,
    pageResolver: (name) => [name.replace(/ /g, "_").toLowerCase()],
    aliasDivider: "|",
    wikiLinkClassName: " ",
    newClassName: " ",
  })
  .use(remarkRehype, { allowDangerousHtml: true });

const crawler = new fdir()
  .withBasePath()
  .filter((path, _isDirectory) => path.endsWith(".md"));
const files = crawler.crawl("example").sync();

const result = files.map(async (file) => {
  const filePath = new URL(file, import.meta.url);
  const contents = await readFile(filePath, { encoding: "utf8" });
  // check if item already in DB
  // - if not proceed
  // - if yes and the same checksum - skip
  // - if yes but different checksum - delete old links and proceed

  // https://github.com/Cyan4973/xxHash
  const checksum = createHash("md5").update(contents, "utf8").digest("hex");
  db.delete(documents).where(eq(documents.path, file)).run();
  db.delete(links).where(eq(links.from, file)).run();

  const doc = await mdParser.parse(contents);

  let frontmatter = {};
  visit(doc as any, (node) => {
    if (node.type === "yaml") {
      frontmatter = parseYaml(node.value);
    }
    if (node.type === "link" || node.type === "wikiLink") {
      db.insert(links).values({ from: file, ast: node }).run();
    }
  });

  const data = { frontmatter, markdown: contents, ast: doc, checksum };
  db.insert(documents)
    .values({ path: file, ...data })
    .onConflictDoUpdate({ target: documents.path, set: data })
    .run();
});

await Promise.all(result);
// console.log(db.select().from(documents).all());
// console.log(db.select().from(links).all());

// TODO: resolve links
// https://github.com/remarkjs/remark-validate-links/blob/main/lib/find/find-references.js#L73-L108
// - `example/index.md` --> `/example`
// - `example/something.md` --> `/example/something`
// Do I need URL in db
// slugify function for files and heders

