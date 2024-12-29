---
title: TODO
draft: true
---

## Dataview

See [[dataview]]

## Astro integration

- [x] Astro integration
- [x] Starlight plugin

## Core

- [ ] maybe rename `documents` to `files`
  - `slug` to `name`?
  - [mddb table structure for comparison](https://github.com/datopian/markdowndb/blob/main/src/lib/schema.ts): files, tags, file_tags, links, tasks
  - `from` column name is conflicting with SQL
    - Maybe rename to `start`/`end`?
    - Maybe rename to `source`/`target`?
  - `frontmatter ->> '$.some.thing'` is very long. Maybe rename to `fm`?
- [ ] Extract Headings
  - either need to allow to pass remark plugins (`import { rehypeHeadingIds } from "@astrojs/markdown-remark";`) or pass slug function
    - https://github.com/withastro/astro/blob/main/packages/markdown/remark/src/rehype-collect-headings.ts
  - separate table
  - path to original document, anchor (aka id, aka slug), ast?, text, level
  - use for link resolution
- [ ] [[frontmatter-schema]]
- [ ] Extract tags?
  - what about other taxonomies?

## Components

- [ ] notes
  - write note about [[metadata]] (frontmatter) in different SSG
  - sort and rewrite old notes
- [x] core
  - [ ] print warning only once `Warning: Error: Failed to get commit for`
  - [ ] improve query interface
  - [ ] extract headers
  - [ ] frontmatter schema
  - [ ] allow to pass remark/rehype plugins?
- [ ] documentation
  - need to clearly describe what is it and how it can be used
  - document options and API
  - provide demos
  - check grammar
- [ ] demos
  - obsidian
  - maybe Next.js

## Performance

- [ ] sql prepared statements
- [ ] [[parallel|parallel processing]]
- [incremental parsing](https://parsing.stereobooster.com/incremental-parsers/)
  - https://github.com/lezer-parser/markdown
  - https://github.com/tree-sitter-grammars/tree-sitter-markdown
  - https://github.com/ikatyang/tree-sitter-markdown

## Support Bun

- use [`great.db`](https://www.npmjs.com/package/great.db) instead of `better-sqlite3`
- use [`xxhash-wasm`](https://github.com/jungomi/xxhash-wasm) instead of `@node-rs/xxhash`
- what about `@napi-rs/simple-git`?

## Ideas for later

- [ ] CLI
  - [ ] respect `.gitignore` and output folder
    - https://www.npmjs.com/package/parse-gitignore
    - https://git-scm.com/docs/gitignore#_pattern_format
    - https://github.com/paulmillr/chokidar#path-filtering
  - [ ] copy other files (images)
- [ ] LSP
  - https://github.com/microsoft/vscode-languageserver-node/tree/main/server
  - https://github.com/foambubble/foam/blob/master/packages/foam-vscode/src/core/model/graph.ts
  - https://github.com/lostintangent/wikilens/blob/main/src/store/actions.ts
  - https://github.com/kortina/vscode-markdown-notes
  - https://github.com/ImperiumMaximus/ts-lsp-client
- [ ] GUI aka "studio"
  - maybe https://tauri.app/
    - https://github.com/tauri-apps/tauri-plugin-fs-watch
  - for inspiration: [drizzle-studio](https://orm.drizzle.team/drizzle-studio/overview), [docsql](https://github.com/peterbe/docsql)
  - it also can be local server instead of desktop application
- [ ] semantic wiki
  - https://github.com/wikibonsai/wikibonsai
- [ ] graph database
  - graph query language, like, Cypher or Datalog
  - graph algorithms, like, PageRank or shortest path

## Other

- read-only mode (for Next.js)
  - https://github.com/thedevdavid/digital-garden
- cache
  - take into account versions of libraries?
    - https://github.com/novemberborn/package-hash
  - do I need to take into account `inode`?
  - BigInt for hash maybe?
    - `UNSIGNED BIG INT`
    - https://orm.drizzle.team/docs/column-types/sqlite#bigint
    - https://github.com/WiseLibs/better-sqlite3/blob/master/docs/integer.md#the-bigint-primitive-type
- yaml
  - https://github.com/biojppm/rapidyaml
  - https://philna.sh/blog/2023/02/02/yaml-document-from-hell-javascript-edition/
- Faceted search
  - Pagefind integration either
    - generate JSON to build index
      - `text()`
    - Or [build index based on generated html](https://github.com/withastro/starlight/blob/d2822a1127c622e086ad8877a07adad70d8c3aab/packages/starlight/index.ts#L61-L72)
  - Update facets lib to support pagefind
- reactivity/memoization
  - [materialite](https://github.com/vlcn-io/materialite)
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
  - [electric-sql: Live queries](https://electric-sql.com/docs/usage/data-access/queries#live-queries)
  - https://github.com/wycats/js-reactivity-benchmark
- [Graphology](https://graphology.github.io/) integration
  - event listener - when node, edge added or node, edge removed
  - show broken links, maybe?
  - PageRank, clustering (related)
- `html()`
  - use `mdast` to `hast`
  - mark broken links with html class
  - syntax highlighter for code
  - and probably something else
