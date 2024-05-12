import { wikiLinkPlugin } from "@stereobooster/remark-wiki-link";

export function remarkWikiLink(options) {
  const { bdb } = options;
  return wikiLinkPlugin({
    aliasDivider: "|",
    linkTemplate: ({ slug, alias }) => {
      const [slugWithoutAnchor, anchor] = slug.split("#");
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
      } else {
        return {
          hName: "span",
          hProperties: {
            class: "broken-link",
            title: `Can't resolve link to ${slug}`,
          },
          hChildren: [{ type: "text", value: alias || slug }],
        };
      }
    },
  });
}
