import { type Unsafe, type Handle } from "mdast-util-to-markdown";

export interface ToMarkdownOptions {
  aliasDivider?: string;
}

export function toMarkdown(opts: ToMarkdownOptions = {}) {
  const aliasDivider = opts.aliasDivider || "|";

  const unsafe = [
    {
      character: "[",
      inConstruct: ["phrasing", "label", "reference"],
    },
    {
      character: "]",
      inConstruct: ["label", "reference"],
    },
  ] satisfies Unsafe[];

  const wikiLink: Handle = (node, _parent, state, _info) => {
    // @ts-expect-error
    const exit = state.enter("wikiLink");

    const nodeValue = state.safe(node.value, { before: "[", after: "]" });

    let value: string;
    if (node.data.alias != null) {
      const nodeAlias = state.safe(node.data.alias, {
        before: "[",
        after: "]",
      });
      value = `[[${nodeValue}${aliasDivider}${nodeAlias}]]`;
    } else {
      value = `[[${nodeValue}]]`;
    }

    exit();

    return value;
  };

  return {
    unsafe: unsafe,
    handlers: {
      wikiLink,
    },
  };
}
