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
import { toString } from "mdast-util-to-string";

const processor = unified()
  .use(stripMarkdown)
  .use(remarkStringify, { resourceLink: false });

// TODO: I'm not sure about this one, need to test it more
export function toText(ast: any) {
  try {
    const root = processor.runSync(ast);
    return processor.stringify(root) as string;
  } catch (e) {
    // sometimes doesn't preserve "readable" formating
    // but works for all extensions
    return toString(ast);
  }
}
