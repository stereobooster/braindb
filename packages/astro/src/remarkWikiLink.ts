import wikiLinkPlugin from "@braindb/remark-wiki-link";
import { BrainDB } from "@braindb/core";

export function remarkWikiLink(options: { bdb: BrainDB }) {
  const { bdb } = options;

  // @ts-expect-error how to type this?
  return wikiLinkPlugin.call(this, {
    linkTemplate: ({ slug, alias }) => {
      const [slugWithoutAnchor, anchor] = slug.split("#");
      if (slugWithoutAnchor) {
        const doc = bdb.documentsSync({ slug: slugWithoutAnchor })[0];
        if (doc) {
          return {
            hName: "a",
            hProperties: {
              href: anchor ? `${doc.url()}#${anchor}` : doc.url(),
            },
            hChildren: [
              {
                type: "text",
                value: alias == null ? doc.frontmatter().title : alias,
              },
            ],
          };
        }
      }

      return {
        hName: "span",
        hProperties: {
          class: "broken-link",
          title: `Can't resolve link to ${slug}`,
        },
        hChildren: [{ type: "text", value: alias || slug }],
      };
    },
  });
}
