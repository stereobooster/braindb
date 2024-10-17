import { BrainDB } from "@braindb/core";
import { visit, SKIP } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

type WikiLinkNode = {
  type: "wikiLink";
  value: string;
  data: {
    alias?: string;
    hName: string;
    hProperties: Record<string, string>;
    hChildren: any[];
  };
};

export const remarkWikiLink: Plugin<[{ bdb: BrainDB }], Root> = ({ bdb }) => {
  return (ast, _file) => {
    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      const slug = node.value;
      const alias = node.data.alias;

      const [slugWithoutAnchor, anchor] = slug.split("#");
      if (slugWithoutAnchor) {
        const doc = bdb.documentsSync({ slug: slugWithoutAnchor })[0];
        if (doc) {
          if (!doc.frontmatter().draft || import.meta.env.DEV) {
            node.data = {
              hName: "a",
              hProperties: {
                href: anchor ? `${doc.url()}#${anchor}` : doc.url(),
                class: doc.frontmatter().draft ? "draft-link" : "",
              },
              hChildren: [
                {
                  type: "text",
                  value: alias == null ? doc.frontmatter().title : alias,
                },
              ],
            };
          }
          return SKIP;
        }
      }

      node.data = {
        hName: "span",
        hProperties: {
          class: "broken-link",
          title: `Can't resolve link to ${slug}`,
        },
        hChildren: [{ type: "text", value: alias || slug }],
      };
      return SKIP;
    });
  };
};
