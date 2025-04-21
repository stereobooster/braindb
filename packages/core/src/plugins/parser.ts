// @ts-expect-error https://github.com/microsoft/TypeScript/issues/42873#issuecomment-2037722981
import type { Root } from "mdast";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import wikiLinkPlugin from "@braindb/remark-wiki-link";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

import { Plugin, Processor } from "unified";
import mdast from "mdast";
import hast from "hast";

export type RemarkPlugin<PluginParameters extends any[] = any[]> = Plugin<
  PluginParameters,
  mdast.Root
>;
export type RemarkPlugins = (
  | string
  | [string, any]
  | RemarkPlugin
  | [RemarkPlugin, any]
)[];
export type RehypePlugin<PluginParameters extends any[] = any[]> = Plugin<
  PluginParameters,
  hast.Root
>;
export type RehypePlugins = (
  | string
  | [string, any]
  | RehypePlugin
  | [RehypePlugin, any]
)[];

export type MarkdownPluginOptions = {
  remarkPlugins?: RemarkPlugins;
  rehypePlugins?: RehypePlugins;
};

export type MarkdownProcessor = Processor<
  mdast.Root,
  mdast.Root,
  hast.Root,
  hast.Root,
  string
>;

export const getParser = (opts: MarkdownPluginOptions = {}) => {
  return (
    unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(wikiLinkPlugin)
      .use(remarkGfm)
      // @ts-expect-error
      .use(opts.remarkPlugins)
      .use(remarkRehype)
      // @ts-expect-error
      .use(opts.rehypePlugins)
      .use(rehypeStringify)
  );
};
