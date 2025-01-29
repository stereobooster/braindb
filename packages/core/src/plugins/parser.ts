// @ts-expect-error https://github.com/microsoft/TypeScript/issues/42873#issuecomment-2037722981
import type { Root } from "mdast";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import wikiLinkPlugin from "@braindb/remark-wiki-link";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from 'rehype-stringify'

export const mdParser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter)
  .use(wikiLinkPlugin)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);
