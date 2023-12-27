# mddb

## Name for the project

- BrainDB - database for your [second brain](https://www.ssp.sh/brain/), [digital garden](https://github.com/MaggieAppleton/digital-gardeners), [zettelkasten](https://zettelkasten.de/posts/overview/)
- DBrain?

How to name subpackages?

- would be nice to use namespace, like `@braindb/core`

## Icon for the project

- [brain](https://thenounproject.com/search/icons/?q=brain)

## Vision

If I would need to describe what this is about in one sentence, I would say - database for your content. But this doesn't really help to grasp the whole concept. Let's take a closer look.

### Content layer

Content layer exists in all static site generators (one way or another). Basically:

- there is folder with content (markdown, json, yaml, images etc)
- there is function to get list of all entries. Also it can sort, filter and paginate
- there is function to get one entry. It can parse content (frontmatter, markdown) and render (to html, for example)
- often there is caching layer and reactive interface

Let's see examples.

#### Hugo

- folder with content: hardcoded to `content`
- list of all entries: [`.Site.Pages`](https://gohugo.io/methods/page/pages/)
  - to sort: `.Site.Pages.ByTitle`
  - to paginate: [`.Paginate collection pageNumber`](https://gohugo.io/methods/page/paginate/)
  - to filter: [`.Site.RegularPages.ByTitle param value`](https://gohugo.io/methods/page/type/)
  - to filter: [`.Resources.ByType value`](https://gohugo.io/methods/page/resources/), `.Resources.GetMatch value`
- one entry:
  - [`.GetPage identifier`](https://gohugo.io/methods/page/getpage/)
  - [`.Resources.Get identifier`](https://gohugo.io/methods/page/getpage/)
- data:
  - html: [`.Content`](https://gohugo.io/methods/page/content/)
  - git metadata: [`.GitInfo`](https://gohugo.io/methods/page/gitinfo/)
  - frontmatter: [`.Params.value`](https://gohugo.io/methods/page/params/)

#### Astro: Content Collections

- folder with content: hardcoded to `src/content`
- list of all entries: [`await getCollection(collection);`](https://docs.astro.build/en/guides/content-collections/#querying-collections)
  - to filter: [`await getCollection(collection, ({ data }) => {... });`](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries)
  - to sort: `.sort((a,b) => { ... })` (standard JS)
  - to paginate: `paginate(collection, { pageSize: 2 })`
- one entry: `const entry = await getEntry(collection, slug);`
- data: `const { Content, headings } = await entry.render();`
  - html: `<Content />`
  - frontmatter: `entry.data`

But compared to Hugo we can as well [specify schema for the content](https://docs.astro.build/en/guides/content-collections/#defining-a-collection-schema):

```js
// 1. Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";

// 2. Define a `type` and `schema` for each collection
const blogCollection = defineCollection({
  type: "content", // v2.5.0 and later
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
export const collections = {
  // Equivalent to `src/content/**/*.{md,mdx}`
  blog: blogCollection,
};
```

#### Contentlayer

- folder with content: defined in `defineDocumentType`
- list of all entries: [`allItems`](https://contentlayer.dev/docs/getting-started-cddd76b7)
  - to filter: `allItems.filter(x => {...})` (standard JS)
  - to sort: `allItems.sort((a, b) => {...})` (standard JS)
- one entry: `allItems.find` (standard JS, I guess)

And we can define schema:

```js
import { defineDocumentType, makeSource } from "contentlayer/source-files";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `**/*.md`,
  fields: {
    title: { type: "string", required: true },
    date: { type: "date", required: true },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (post) => `/posts/${post._raw.flattenedPath}`,
    },
  },
}));
```

#### Other

- [NuxtContent](https://content.nuxt.com/usage/markdown#front-matter)

### Content graph

Articles (markdown files) plus hyperlinks (`[some](/thing)`) form graph. Some solutions allows to treat content as graph:

- link resolution: wiki-links, [portable markdown links](https://stereobooster.com/posts/portable-markdown-links/)
- backlinks
- visualize content as graph
- detect broken links

#### Obsidian

- [wiki-links and markdown links](https://help.obsidian.md/Linking+notes+and+files/Internal+links)
- [backlinks](https://help.obsidian.md/Plugins/Backlinks)
- [visualize content as graph](https://help.obsidian.md/Plugins/Graph+view)

#### Quartz

- [wiki-links and markdown links](https://quartz.jzhao.xyz/features/wikilinks)
- [backlinks](https://quartz.jzhao.xyz/features/backlinks)
- [visualize content as graph](https://quartz.jzhao.xyz/features/graph-view)

#### Other

- detect broken links: [remark-lint-no-dead-urls](https://github.com/remarkjs/remark-lint-no-dead-urls), [mdv](https://github.com/Mermade/mdv), [markdown-link-check](https://github.com/tcort/markdown-link-check), [remark-validate-links](https://github.com/remarkjs/remark-validate-links)
- visualize content as graph: [markdown-links](https://github.com/tchayen/markdown-links), [markmap.js](https://markmap.js.org/docs/packages--markmap-cli), [dundalek/markmap](https://github.com/dundalek/markmap)
- markdown links: [obsidian-export](https://github.com/zoni/obsidian-export)

### Query interface

Content layer already exposes some basic query interface. But there are solutions which brings this idea further, they expose query interface as query language.

Most notable solutions in this area are: [docsql](https://github.com/peterbe/docsql), [obsidian-dataview](https://blacksmithgu.github.io/obsidian-dataview/). They allow to use SQL-like language to query the content.

Other options would be to use some kind of [faceted search interface](https://stereobooster.com/posts/faceted-search/). Or use graph-query language, like Cypher or Datalog.

### Core

Main disadvantage of all solutions mentioned above (maybe exept `Contentlayer`) is that they are built in another applications and not reusable. I think it would be beneficial to implement **core** library which later could be reused for:

- content layer for Astro (or Next.js, Nuxt etc.)
- Language Server ([LSP](https://microsoft.github.io/language-server-protocol/))
- CLI to transfor markdown files, for example from Obsidian vault to Hugo format
- second-brain-note-taking app, like Obsidian or Foam

## TODO

- Astro integration
  - `html()`
    - use mdast to hast instead of hack with reparsing
    - mark broken links with html class
    - syntax highlighter for code
    - and probably something else
- `Link` class
  - to use with `backlinks` and similar methods
  - accessors: `from()`, `to()`, `label()`, `anchor()`, `title()` document title or header
- frontmatter
  - `schema`
- CLI
  - use `.braindb` as folder instead of file?
- Astro integration 2
  - local graph
    - for graph with depth 1: `backDocuments` and `forwardDocuments` would be enough
    - `cyto-nodejs` doesn't fit. I want to try https://github.com/graphology/graphology/blob/master/src/svg/index.js
  - maybe global graph
  - maybe faceted search
- [ ] cache https://ziglang.org/download/0.4.0/release-notes.html#Build-Artifact-Caching
- [ ] reactivity
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
- schema
  - inheritance - subfolders different schema or type of page
  - typescript
- metadata
  - frontmatter
  - gitinfo
  - incoming links
- [great.db](https://www.npmjs.com/package/great.db) instead of better-sqlite3?
