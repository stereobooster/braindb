import { unified } from "unified";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import wikiLinkPlugin from "@stereobooster/remark-wiki-link";
import remarkStringify from "remark-stringify";
// import remarkMdx from "remark-mdx"

export const mdParser = unified()
  // @ts-expect-error
  .use(remarkParse)
  // @ts-expect-error
  .use(remarkFrontmatter)
  .use(wikiLinkPlugin, { aliasDivider: "|" })
  // @ts-expect-error
  .use(remarkStringify, { resourceLink: false });
