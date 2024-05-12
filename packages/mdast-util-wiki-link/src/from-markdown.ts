import {
  type CompileContext,
  type Handle,
  type Token,
} from "mdast-util-from-markdown";

import { type Node, type Data } from "unist";

interface WikiLinkHProperties {
  className: string;
  href: string;
  [key: string]: unknown;
}

interface WikiLinkData extends Data {
  alias: string;
  permalink: string | undefined;
  hName: string;
  hProperties: WikiLinkHProperties;
  hChildren: Array<{ type: string; value: string }>;
}

export interface WikiLinkNode extends Node {
  data: WikiLinkData;
  value: string;
}

type LinkTemplateProps = {
  slug: string;
  permalink?: string;
  alias?: string;
};

function defaultLinkTemplate({
  slug,
  permalink,
  alias,
}: LinkTemplateProps): any {
  return {
    hName: "a",
    hProperties: { href: permalink == null ? slug : permalink },
    hChildren: [{ type: "text", value: alias == null ? slug : alias }],
  };
}

export interface FromMarkdownOptions {
  linkResolver?: (x: string) => string;
  linkTemplate?: typeof defaultLinkTemplate;
}

export function fromMarkdown(opts: FromMarkdownOptions = {}) {
  const linkTemplate = opts.linkTemplate || defaultLinkTemplate;
  let node: WikiLinkNode;

  function enterWikiLink(this: CompileContext, token: Token) {
    node = {
      type: "wikiLink",
      value: null,
      data: {
        // alias: null,
        // permalink: null
      },
    } as any;
    // @ts-expect-error
    this.enter(node, token);
  }

  function top<T>(stack: T[]) {
    return stack[stack.length - 1];
  }

  function exitWikiLinkAlias(this: CompileContext, token: Token) {
    const alias = this.sliceSerialize(token);
    const current = top(this.stack);
    // @ts-expect-error
    current.data.alias = alias;
  }

  function exitWikiLinkTarget(this: CompileContext, token: Token) {
    const target = this.sliceSerialize(token);
    const current = top(this.stack);
    // @ts-expect-error
    current.value = target;
  }

  function exitWikiLink(this: CompileContext, token: Token) {
    this.exit(token);
    const wikiLink = node;

    const data = {
      slug: wikiLink.value,
      alias: wikiLink.data.alias,
      permalink: opts.linkResolver
        ? opts.linkResolver(wikiLink.value)
        : undefined,
    };

    wikiLink.data = {
      // ...wikiLink.data,
      alias: data.alias,
      permalink: data.permalink,
      ...linkTemplate(data),
    };
  }

  return {
    enter: {
      wikiLink: enterWikiLink satisfies Handle,
    },
    exit: {
      wikiLinkTarget: exitWikiLinkTarget satisfies Handle,
      wikiLinkAlias: exitWikiLinkAlias satisfies Handle,
      wikiLink: exitWikiLink satisfies Handle,
    },
  };
}
