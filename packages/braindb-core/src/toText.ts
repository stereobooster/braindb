/**
 * Alternatives:
 *
 * - [mdast-util-to-string](https://www.npmjs.com/package/mdast-util-to-string)
 * - [remark-mdx-to-plain-text](https://www.npmjs.com/package/remark-mdx-to-plain-text)
 * - [remark-plain-text](https://www.npmjs.com/package/remark-plain-text)
 * - [strip-markdown](https://www.npmjs.com/package/strip-markdown)
 */

import { unified } from "unified";
import stripMarkdown from "strip-markdown";
import remarkStringify from "remark-stringify";

const processor = unified()
  .use(stripMarkdown)
  // @ts-ignore
  .use(remarkStringify, { resourceLink: false });

export function toText(ast: any) {
  const root = processor.runSync(ast);
  return processor.stringify(root) as string;
}
