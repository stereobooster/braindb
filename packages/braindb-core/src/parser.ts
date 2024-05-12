// @ts-expect-error https://github.com/microsoft/TypeScript/issues/42873#issuecomment-2037722981
import type { Root } from "mdast";

import { unified } from "unified";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import wikiLinkPlugin from "@braindb/remark-wiki-link";
import remarkStringify from "remark-stringify";
import remarkGfm from "remark-gfm";
// import remarkMdx from "remark-mdx"

export const mdParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(wikiLinkPlugin)
  .use(remarkGfm)
  .use(remarkStringify, { resourceLink: false });
