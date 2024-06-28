---
title: remark-wiki-link
---

`remark-wiki-link` consists of 3 projects:

- `micromark-extension-wiki-link`
- `mdast-util-wiki-link`
- `remark-wiki-link`

I moved all 3 projects in monorepo - this way it is more convinient to work. Changed all plugins to TypeScript, simplified build process (ES6 only), changed options.

It is also worth to mention: [wikirefs](https://github.com/wikibonsai/wikirefs).

## Open questions

**But there is more**...

```js
export function remarkWikiLink(options) {
  const { bdb } = options;

  return wikiLinkPlugin.call(this, {
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
```

- [ ] What about direct integration with BrainDB? (see code above 👆)
- [ ] What about [PML](https://stereobooster.com/posts/portable-markdown-links/)?
- [ ] Related functionality [Icons for external links](https://astro-digital-garden.stereobooster.com/recipes/icons-to-external-links/)
- [ ] support anchors in wikilinks (`[[page#anchor]]`, `[[page#anchor|alias]]`)
  - do we need to url-encode anchors?
  - do we need to slugify anchors?
  - check that anchors correspond to some header in target document
- [ ] what about ambiguous links (`bdb.documentsSync({ slug: permalink }).length > 1`)?
- [ ] image wikilinks (`![[some.jpg]]`)

### Options

- make general plugin for all links, like `remark-code-hook`?
  - and based on it resolve both wikilinks and PML
  - maybe call it `remark-link-resolver`?
- make another plugin which would take `BrainDB` as option
- use named exports in `remark-wkik-link` to expose "classic" and "new" versions
  - where "new" is plugin which would take `BrainDB` as option
