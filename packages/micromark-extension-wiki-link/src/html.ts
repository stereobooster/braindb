import { type CompileContext, type Token } from "micromark-util-types";

interface WikiLink {
  target: string;
  alias?: string;
}

export type WikiLinkHtmlOptions = {
  permalinks?: string[];
  pageResolver?: (name: string) => string[];
  newClassName?: string;
  wikiLinkClassName?: string;
  hrefTemplate?: (name: string) => string;
};

function html(opts: WikiLinkHtmlOptions = {}) {
  const permalinks = opts.permalinks || [];
  const defaultPageResolver = (name: string) => [
    name.replace(/ /g, "_").toLowerCase(),
  ];
  const pageResolver = opts.pageResolver || defaultPageResolver;
  const newClassName = opts.newClassName || "new";
  const wikiLinkClassName = opts.wikiLinkClassName || "internal";
  const defaultHrefTemplate = (permalink: string) => `#/page/${permalink}`;
  const hrefTemplate = opts.hrefTemplate || defaultHrefTemplate;

  function enterWikiLink(this: CompileContext): void {
    // @ts-expect-error
    let stack: WikiLink[] = this.getData("wikiLinkStack");
    // @ts-expect-error
    if (!stack) this.setData("wikiLinkStack", (stack = []));

    // @ts-expect-error
    stack.push({});
  }

  function top<T>(stack: T[]) {
    return stack[stack.length - 1];
  }

  function exitWikiLinkAlias(this: CompileContext, token: Token): void {
    const alias = this.sliceSerialize(token);
    // @ts-expect-error
    const current = top(this.getData("wikiLinkStack") as WikiLink[]);
    current.alias = alias;
  }

  function exitWikiLinkTarget(this: CompileContext, token: Token): void {
    const target = this.sliceSerialize(token);
    // @ts-expect-error
    const current = top(this.getData("wikiLinkStack") as WikiLink[]);
    current.target = target;
  }

  function exitWikiLink(this: CompileContext): void {
    // @ts-expect-error
    const wikiLink = (this.getData("wikiLinkStack") as WikiLink[]).pop()!;

    const pagePermalinks = pageResolver(wikiLink.target!);
    let permalink = pagePermalinks.find((p) => permalinks.indexOf(p) !== -1);
    const exists = permalink !== undefined;
    if (!exists) {
      permalink = pagePermalinks[0];
    }
    let displayName = wikiLink.target!;
    if (wikiLink.alias) {
      displayName = wikiLink.alias;
    }

    let classNames = wikiLinkClassName;
    if (!exists) {
      classNames += " " + newClassName;
    }

    this.tag(
      '<a href="' + hrefTemplate(permalink!) + '" class="' + classNames + '">'
    );
    this.raw(displayName);
    this.tag("</a>");
  }

  return {
    enter: {
      wikiLink: enterWikiLink,
    },
    exit: {
      wikiLinkTarget: exitWikiLinkTarget,
      wikiLinkAlias: exitWikiLinkAlias,
      wikiLink: exitWikiLink,
    },
  };
}

export { html };
