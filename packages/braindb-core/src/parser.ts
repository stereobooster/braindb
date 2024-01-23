import { unified } from "unified";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
// @ts-expect-error
import wikiLinkPlugin from "remark-wiki-link";
import remarkStringify from "remark-stringify";
// import remarkMdx from "remark-mdx"

export const mdParser = unified()
  // @ts-expect-error
  .use(remarkParse)
  // @ts-expect-error
  .use(remarkFrontmatter)
  .use(wikiLinkPlugin, {
    hrefTemplate: (permalink: any) => permalink,
    pageResolver: (name: any) => [decodeURI(name).toLowerCase()],
    aliasDivider: "|",
    wikiLinkClassName: " ",
    newClassName: " ",
  })
  // @ts-expect-error
  .use(remarkStringify, { resourceLink: false });
