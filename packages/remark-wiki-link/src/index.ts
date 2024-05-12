import { syntax } from "@braindb/micromark-extension-wiki-link";
import {
  fromMarkdown,
  toMarkdown,
  FromMarkdownOptions,
  ToMarkdownOptions,
} from "@braindb/mdast-util-wiki-link";

export type RemarkWikiLinkOptions = FromMarkdownOptions & ToMarkdownOptions;

export function remarkWikiLink(opts: RemarkWikiLinkOptions = {}) {
  // @ts-expect-error: TS is wrong about `this`.
  const self = /** @type {import('unified').Processor<Root>} */ this;
  const data = self.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(syntax(opts));
  fromMarkdownExtensions.push(fromMarkdown(opts));
  toMarkdownExtensions.push(toMarkdown(opts));
}

export default remarkWikiLink;
