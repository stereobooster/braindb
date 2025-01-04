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
    const promises: Promise<any>[] = [];

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      const slug = node.value;
      const alias = node.data.alias;

      const [slugWithoutAnchor, anchor] = slug.split("#");
      if (slugWithoutAnchor) {
        promises.push(
          bdb
            .kysely()
            .selectFrom("files")
            .select(["files.url", "files.data"])
            .where("files.slug", "=", slugWithoutAnchor)
            .limit(1) // can use 2 to check that there is only one
            .execute()
            .then(([doc]) => {
              if (doc) {
                if (
                  !doc.data.draft ||
                  (import.meta.env && import.meta.env.DEV)
                ) {
                  node.data = {
                    hName: "a",
                    hProperties: {
                      href: anchor ? `${doc.url}#${anchor}` : doc.url,
                      class: doc.data.draft ? "draft-link" : "",
                    },
                    hChildren: [
                      {
                        type: "text",
                        value: alias == null ? doc.data.title : alias,
                      },
                    ],
                  };
                }
              }
            })
        );
        return SKIP;
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

    if (promises.length === 0) return;
    return Promise.all(promises).then(() => {});
  };
};
