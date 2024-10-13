---
title: Vision
sidebar:
  order: 1
tags: [idea]
---

If I had to describe what this is about in one sentence, I would say it is a database for your content. However, this doesn’t really help to grasp the whole concept. Let’s take a closer look.

## Content Layer

The content layer exists in all static site generators (one way or another). Basically:

- There is a folder with content (Markdown, JSON, YAML, images, etc.)
- There is a function to get a list of all entries. It can also sort, filter, and paginate.
- There is a function to get one entry. It can parse content (frontmatter, Markdown) and render it (to HTML, for example).
- Often, there is a caching layer and a reactive interface.

Let’s see some examples.

### Hugo

- Folder with content: hardcoded to `content`
- List of all entries: [`.Site.Pages`](https://gohugo.io/methods/page/pages/)
  - To sort: `.Site.Pages.ByTitle`
  - To paginate: [`.Paginate collection pageNumber`](https://gohugo.io/methods/page/paginate/)
  - To filter: [`.Site.RegularPages.ByTitle param value`](https://gohugo.io/methods/page/type/)
  - To filter: [`.Resources.ByType value`](https://gohugo.io/methods/page/resources/), `.Resources.GetMatch value`
- One entry:
  - [`.GetPage identifier`](https://gohugo.io/methods/page/getpage/)
  - [`.Resources.Get identifier`](https://gohugo.io/methods/page/getpage/)
- Data:
  - HTML: [`.Content`](https://gohugo.io/methods/page/content/)
  - Git metadata: [`.GitInfo`](https://gohugo.io/methods/page/gitinfo/)
  - Frontmatter: [`.Params.value`](https://gohugo.io/methods/page/params/)

### Astro: Content Collections

- Folder with content: hardcoded to `src/content`
- List of all entries: [`await getCollection(collection);`](https://docs.astro.build/en/guides/content-collections/#querying-collections)
  - To filter: [`await getCollection(collection, ({ data }) => {... });`](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries)
  - To sort: `.sort((a,b) => { ... })` (standard JS)
  - To paginate: `paginate(collection, { pageSize: 2 })`
- One entry: `const entry = await getEntry(collection, slug);`
- Data: `const { Content, headings } = await entry.render();`
  - HTML: `<Content />`
  - Frontmatter: `entry.data`

Compared to Hugo, we can also [specify a schema for the content](https://docs.astro.build/en/guides/content-collections/#defining-a-collection-schema):

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

### Contentlayer

- Folder with content: defined in `defineDocumentType`
- List of all entries: [`allItems`](https://contentlayer.dev/docs/getting-started-cddd76b7)
  - To filter: `allItems.filter(x => {...})` (standard JS)
  - To sort: `allItems.sort((a, b) => {...})` (standard JS)
- One entry: `allItems.find` (standard JS, I believe)

We can also define a schema:

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

### Other

- [NuxtContent](https://content.nuxt.com/usage/markdown#front-matter)

## Content Graph

Articles (Markdown files) plus hyperlinks (`[some](/thing)`) form a graph. Some solutions allow us to treat content as a graph:

- Link resolution: wiki-links, [portable markdown links](https://stereobooster.com/posts/portable-markdown-links/)
- Backlinks
- Visualize content as a graph
- Detect broken links

### Obsidian

- [Wiki-links and markdown links](https://help.obsidian.md/Linking+notes+and+files/Internal+links)
- [Backlinks](https://help.obsidian.md/Plugins/Backlinks)
- [Visualize content as a graph](https://help.obsidian.md/Plugins/Graph+view)

### Quartz

- [Wiki-links and markdown links](https://quartz.jzhao.xyz/features/wikilinks)
- [Backlinks](https://quartz.jzhao.xyz/features/backlinks)
- [Visualize content as a graph](https://quartz.jzhao.xyz/features/graph-view)

### Other

- Detect broken links: [remark-lint-no-dead-urls](https://github.com/remarkjs/remark-lint-no-dead-urls), [mdv](https://github.com/Mermade/mdv), [markdown-link-check](https://github.com/tcort/markdown-link-check), [remark-validate-links](https://github.com/remarkjs/remark-validate-links)
- Visualize content as a graph: [markdown-links](https://github.com/tchayen/markdown-links), [markmap.js](https://markmap.js.org/docs/packages--markmap-cli), [dundalek/markmap](https://github.com/dundalek/markmap)
- Markdown links: [obsidian-export](https://github.com/zoni/obsidian-export)

## Query Interface

The content layer already exposes some basic query interfaces. However, there are solutions that take this idea further by exposing a query interface as a query language.

The most notable solutions in this area are: [docsql](https://github.com/peterbe/docsql) and [obsidian-dataview](https://blacksmithgu.github.io/obsidian-dataview/). They allow users to use a SQL-like language to query the content.

Other options include using some kind of [faceted search interface](https://stereobooster.com/posts/faceted-search/) or employing a graph-query language, like Cypher or Datalog.

## Core

The main disadvantage of all solutions mentioned above (except for `Contentlayer`) is that they are built into other applications and are not reusable. I believe it would be beneficial to implement a **core** library that could later be reused for:

- Content layer for Astro (or Next.js, Nuxt, etc.)
- Language Server ([LSP](https://microsoft.github.io/language-server-protocol/))
- CLI to transform Markdown files, for example, from an Obsidian vault to Hugo format
- A second-brain note-taking app, like Obsidian or Foam
