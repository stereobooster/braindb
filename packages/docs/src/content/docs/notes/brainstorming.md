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

## Ideas

- refuse from API in favour of SQL (Kysely)

## New DB structure

```d2
files: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  mtime: real
  checksum: text
  cfghash: integer
  updated_at: integer
  revision: integer
  file_type: text
  slug: text
  url: text
  data: json
}

md_files: {
  shape: sql_table
  id: int {constraint: primary_key}
  -frontmatter: json
  ast: json
  ?text: text
}

files.id -> md_files.id

links: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  pos: integer {constraint: AK}
  to: text
  to_slug: text
  to_url: text
  to_path: text
  to_anchor: text
  line: integer
  column: integer
  ?text: text
}

files.path -> links.path
files.path -> links.to

md_tasks: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  pos: integer {constraint: AK}
  ast: json
  checked: bool
  line: integer
  column: integer
  ?text: text
}

files.path -> md_tasks.path

md_header: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  pos: integer {constraint: AK}
  ast: json
  line: integer
  column: integer
  ?text: text
  ?anchor: text
}

files.path -> md_header.path

files.path -> md_tags?.path

md_tags?: {
  shape: sql_table
  id: integer {constraint: primary_key}
  path: text {constraint: AK}
  text: text
}
```

- `pos` = `column` + `line`
- `text` = `label` for links
- `checksum` change to number?
- `text` for full text search
- `file_type` = `markdown | image | json | diagram | ...`

ala Single Table Inheritance

| 1     | 2    | 3                   |
| ----- | ---- | ------------------- |
| start | from | source              |
| end   | to   | destination, target |

## Priority

- [x] remove wrapper-classes and related query functions (this breaks compatibility immediately, but easier to refactor)
  - `Document`, `Link`, `documentsSync`, `documents`, `findDocumentSync`, `linksSync`, `tasks` etc.
- rename all SQL tables, columns
  - [x] `from` -> `source`, `to` -> `target`
  - [x] `frontmatter` -> `data`
  - [ ] rename all `Document` to `File` (`addDocument`, `getDocumentsFrom`, ...)
  - [ ] maybe `files.path` -> `files.source`?
  - [ ] maybe prefix service fields (`checksum`, `mtime`, etc.) with `_`, so it would be clear this is not for public use?
  - [ ] maybe create `documents` [view](https://orm.drizzle.team/docs/views) as fallback
- [x] change filewatcher to watch all files
- [ ] expose query interface. I think about Kysely
  - replace Drizzle with Kysely
    - [migrations](https://kysely.dev/docs/migrations)
- [ ] create first plugin (for markdown)
  - extract data, ast, (text?). Render to HTML
  - match file extension (`.md`, `.mdx`)
- [ ] create plugin for images (to make sure plugin system works)
  - extract dimensions

### Other

- remark-wiki-img
- rehype-embeddable
  - https://github.com/r4ai/remark-embed
- remark-dataview (JS eval)
- new diagram tool
