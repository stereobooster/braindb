---
title: Metadata
draft: true
---

Metadata can come from frontmatter or can be computed

**Content**:

|              | frontmatter   | auto generated              | usage                                                                                                                                                                                                                    |
| ------------ | ------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Title        | `title`       | File name                   | `<title>`, `og:title`, `twitter:title`, social-images-autogenration                                                                                                                                                      |
| Description  | `description` | Text summarization          | `<meta name="description">`, `og:description`, `twitter:description`, social-images-autogenration                                                                                                                        |
| Image        | ?             | social-images-autogenration | `og:image`, `twitter:image`, cover image for post, small image for list                                                                                                                                                  |
| Slug         | `slug`        | File name or path           | wikilinks, url generation                                                                                                                                                                                                |
| Last Updated | `lastUpdated` | Based on git                | "Last updated" on on page or in list, "Recently changed" page, [schema](https://schema.org/dateModified) (`dateModified`), [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) (`lastmod`), search |
| Tags         | `tags`        | -                           | Tag list page, Tags on page or in list, search                                                                                                                                                                           |

**Functional**: `tableOfContents`, `banner`, `pagefind`, `draft`, `sidebar`

**Other**:

- It should be possible to assign metadata for each page and/or tag. For example, it can be `color` or `icon`. Then this metadata can be reused:
  - color and icon for nodes in in content graph
  - icons can be shown for tags
  - icons can be shown for pages in sidebar and near link to them
  - page may have `stage` field (idea, draft, in progress, or finished). Right now I use emojis: 🧠, 🚷, 🚧. Similar idea: [Taxonomy of note types](https://www.ssp.sh/brain/taxonomy-of-note-types/)
  - some pages have `aka` field
  - for tags `color` can be generated automaticially: ["scale"](https://d3js.org/d3-scale-chromatic/categorical) or [color-hash](https://github.com/zenozeng/color-hash)
- Functional metadata:
  - I can implement `alias` with "catch all" `[...path].astro`
    - but also need to exclude it from sitemap
    ```astro
    ---
    export function getStaticPaths() {
      return [{ params: { path: "test-redirect" } }];
    }
    ---
    ```
  - `description`
    - Can I generate it automatically? Let's say take `hast-util-to-string`, `trim()` and slcie first 150 chars
    - https://github.com/topics/text-summarization?l=javascript
  - exclude from `sitemap`

## Links

- https://gohugo.io/content-management/front-matter/
- https://starlight.astro.build/reference/frontmatter/
- https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-pages#markdown-front-matter
- https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
- https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog#markdown-front-matter
- https://content.nuxt.com/usage/markdown#front-matter
- https://jekyllrb.com/docs/front-matter/
- https://hexo.io/docs/front-matter
- https://v1.vuepress.vuejs.org/guide/frontmatter.html#predefined-variables
- https://v1.d.umijs.org/config/frontmatter
- https://vitepress.dev/reference/frontmatter-config
- https://docs.asciidoctor.org/asciidoc/latest/attributes/document-attributes-ref/
- https://www.mkdocs.org/user-guide/writing-your-docs/#meta-data
