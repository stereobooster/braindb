import {
  type CompileContext,
  type Handle,
  type Token,
} from "mdast-util-from-markdown";

interface FromMarkdownOptions {
  permalinks?: string[];
  pageResolver?: (name: string) => string[];
  newClassName?: string;
  wikiLinkClassName?: string;
  hrefTemplate?: (permalink: string) => string;
}

export function fromMarkdown(opts: FromMarkdownOptions = {}) {
  const permalinks = opts.permalinks || [];
  const defaultPageResolver = (name: string) => [
    name.replace(/ /g, "_").toLowerCase(),
  ];
  const pageResolver = opts.pageResolver || defaultPageResolver;
  const newClassName = opts.newClassName || "new";
  const wikiLinkClassName = opts.wikiLinkClassName || "internal";
  const defaultHrefTemplate = (permalink: string) => `#/page/${permalink}`;
  const hrefTemplate = opts.hrefTemplate || defaultHrefTemplate;
  let node: any;

  function enterWikiLink(this: CompileContext, token: Token) {
    node = {
      type: "wikiLink",
      value: null,
      data: {
        alias: null,
        permalink: null,
        exists: null,
      },
    };
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

    const pagePermalinks = pageResolver(wikiLink.value);
    const target = pagePermalinks.find((p) => permalinks.indexOf(p) !== -1);
    const exists = target !== undefined;

    let permalink: string;
    if (exists) {
      permalink = target;
    } else {
      permalink = pagePermalinks[0] || "";
    }

    let displayName = wikiLink.value;
    if (wikiLink.data.alias) {
      displayName = wikiLink.data.alias;
    }

    let classNames = wikiLinkClassName;
    if (!exists) {
      classNames += " " + newClassName;
    }

    wikiLink.data.alias = displayName;
    wikiLink.data.permalink = permalink;
    wikiLink.data.exists = exists;

    wikiLink.data.hName = "a";
    wikiLink.data.hProperties = {
      className: classNames,
      href: hrefTemplate(permalink),
    };
    wikiLink.data.hChildren = [
      {
        type: "text",
        value: displayName,
      },
    ];
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
