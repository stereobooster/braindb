---
title: Brainstorming
draft: true
---

## Core

```d2
direction: right

bdb: BrainDB {
  files.style.multiple: true
  files.shape: page
  file watcher
  SQLite.shape: cylinder
  Kysely.shape: package
  event dispatcher.shape: package

  files -- file watcher
  file watcher -- SQLite -- Kysely
  file watcher -- event dispatcher
}

# hack to do empty arrows
bdb.Kysely -> out1: {target-arrowhead.shape: circle}
bdb.event dispatcher -> out2: {target-arrowhead.shape: circle}
out1 -> x: {style.opacity: 0}
out2 -> x: {style.opacity: 0}
out1: {style.opacity: 0}
out2: {style.opacity: 0}
x: {style.opacity: 0}
```

## Astro integration

```d2
direction: right
grid-rows: 3
grid-columns: 4

Astro content layer
a: {style.opacity: 0}
remark
html

b: {style.opacity: 0}
remark-wiki-link
remark-dataview
c: {style.opacity: 0}

bdb: BrainDB
Astro content layer -> remark -> html
bdb -- remark-wiki-link -- remark
bdb -- remark-dataview -- remark
```

## As content layer

- option to add remark/rehype plugins
- function to generate html

## New DB structure

```d2
files: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  _mtime: real
  _checksum: integer
  _cfghash: integer
  _revision: integer
  type: text
  updated_at: integer
  slug: text
  url: text
  data: json
  _ast: json
}

links: {
  shape: sql_table
  id: integer {constraint: primary_key}
  source: text {constraint: AK}
  pos: integer {constraint: AK}
  target: text
  _target_slug: text
  _target_url: text
  _target_path: text
  target_anchor: text
  _line: integer
  _column: integer
}

files.path -> links.source
files.path -> links.target

md_tasks: {
  shape: sql_table
  id: integer {constraint: primary_key}
  source: text {constraint: AK}
  pos: integer {constraint: AK}
  _ast: json
  checked: bool
  _line: integer
  _column: integer
}

files.path -> md_tasks.source

md_header?: {
  shape: sql_table
  id: integer {constraint: primary_key}
  source: text {constraint: AK}
  pos: integer {constraint: AK}
  _ast: json
  _line: integer
  _column: integer
  ?text: text
  ?anchor: text
}

files.path -> md_header?.source

files.path -> md_tags?.source

md_tags?: {
  shape: sql_table
  id: integer {constraint: primary_key}
  source: text {constraint: AK}
  text: text
}
```

- `text` for full text search
- `type` = `markdown | image | json | diagram | ...`

ala Single Table Inheritance

| 1     | 2    | 3                   |
| ----- | ---- | ------------------- |
| start | from | source              |
| end   | to   | destination, target |

## Priority

- [x] remove wrapper-classes and related query functions (this breaks compatibility immediately, but easier to refactor)
  - `Document`, `Link`, `documentsSync`, `documents`, `findDocumentSync`, `linksSync`, `tasks` etc.
- [x] change filewatcher to watch all files
- [x] expose query interface
- plugin for markdown
  - [x] extract data, ast
- replace Drizzle with Kysely
  - [x] create scheme
  - [x] Kysely doesn't support `sync` execution, so I would need to change [remarkWikiLink](packages/astro/src/remarkWikiLink.ts)
  - [x] replace all internal drizzle before migration
  - [x] [migrations](https://kysely.dev/docs/migrations)
  - [ ] I'm on the fence with `sync` execution of SQLite
- [ ] sample site, to make sure contentlayer works. Maybe:
  - https://fumadocs.vercel.app/docs/headless/remote
  - https://stereobooster.com/posts/components-for-web/
  - https://imfing.github.io/hextra/docs/guide/markdown/
- contentlayer
  - [ ] Render to HTML (markdown plugin)
    - accepts `path`, returns string
  - [ ] documentation
    - `kysely`, `events`, ~~`render`~~ `html`
  - [ ] [type](https://www.sqlite.org/datatype3.html) issues
    - `boolean` represented as `number`
    - `date` represented as `number`
    - [`JSON`](https://github.com/WiseLibs/better-sqlite3/issues/99) represented as `string`
    - Does [pglite](https://github.com/dnlsandiego/kysely-pglite) handle types better?
- rename all SQL tables, columns
  - [x] `from` -> `source`, `to` -> `target`
  - [x] `frontmatter` -> `data`
  - [x] rename all `Document` to `File` (`addDocument`, `getDocumentsFrom`, ...)
  - [ ] maybe `files.path` -> `files.source`? or `*.source` -> `*.path`
  - [ ] maybe prefix service fields (`checksum`, `mtime`, etc.) with `_`, so it would be clear this is not for public use?
- [ ] create plugin for images (to make sure plugin system works)
  - extract dimensions
- [ ] create plugin for JSON
- maybe backward compatibility
  - [ ] maybe create `documents` [view](https://orm.drizzle.team/docs/views) as fallback
  - [ ] restore deleted classes and methods (from 1-st item)

### Other

- remark-rehype plugins
  - `remarkParse`, `remarkFrontmatter`, `wikiLinkPlugin`, `remarkGfm`
  - 👉 user supplied remark plugins
  - 👈 store `AST`
  - dataview, wiki link resolution (order important)
  - `remarkRehype`
  - 👉 user supplied rehype plugins
  - 👈 render `HTML`
- DX
  - live-reload: I have events, but I need to figure out how to implement plugins for Vite / Next.js
  - TypeScript: I have idea on how to add schema, but I need to figure out details
  - MDX: I can easily render Markdown, but MDX would be more complicated
- schema
  - `validated` table: `path`, `schema_name`. Every valid file added to this table
    - I can't do post-validation, because this way I would not know which are valid during SQL execution
  - maybe add view on top: `SELECT path, data FROM file WHERE schema_name = <schema>`
    - but this won't allow "strict" schemas (which don't allow extra fields)
    - can I add views dynamically to "query" interface?
- remark-wiki-img
- rehype-embeddable
  - image special tags in URL
  - https://github.com/r4ai/remark-embed
- remark-dataview (JS eval)
- remark-dataview (diagram)
  - probably general graph, like grapviz or vizdom
- website (aka astro theme)
- LSP
- new diagram tool
  - general graph
    - shape, icon, link, color
  - ERD
  - Sequence diagram
- tree representation in DB for: headers, tasks
- `.gitignore`
- file-to-table solution (csv, JSONL etc.)
  - do I have use-case for it? I can read file directly from fs
- backlinks point to source paragraph (anchor)
