# mddb

To install dependencies:

```bash
bun install
```

To run:

```bash
cd packages/braindb-cli
bun run index.ts
```

This project was created using `bun init` in bun v1.0.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Names for the project

- BrainDB - database for your [second brain](https://www.ssp.sh/brain/), [digital garden](https://github.com/MaggieAppleton/digital-gardeners), [zettelkasten](https://zettelkasten.de/posts/overview/)

## concept

### Core

db instance with API:

- [ ] `Read/Write, Source/Root`
- [ ] test with real life example
- [ ] generate beautiful graph
- generate JSON for Quartz graphs
  - [ ] backlinks
  - [ ] local graph
  - [ ] global graph
- [ ] a way to clean up deleted files
  - mark all new files (`created_at`) than delete from DB and emit events
- [ ] respect `.gitignore` and output folder
  - https://www.npmjs.com/package/parse-gitignore
  - https://git-scm.com/docs/gitignore#_pattern_format
  - https://github.com/paulmillr/chokidar#path-filtering
- events for adding/deleting edges
- other
  - `get` (by path)
  - `getOutgoingLinks`
  - `getIncomingLinks`
- `query` ?
  - reactive
    - https://rxdb.info/quickstart.html
    - https://rethinkdb.com/docs/sql-to-reql/javascript/
  - specify or discover metadata (frontmatter)
    - https://docs.astro.build/en/guides/content-collections/#defining-a-collection-schema
  - sql transformation [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)
    - `from "path"`
    - `select`/`where`/`order` metdata fields
    - alternatives to `select` - `table`, `plot`, `graph`
    - path queries
      - [datalog](https://docs.cozodb.org/en/latest/tips.html)
      - [cypher](https://kuzudb.com/docusaurus/cypher/query-clauses/match)
  - [other graph formats](https://graph.stereobooster.com/notes/File-formats)

### CLI

- test with real life example
  - https://github.com/gohugoio/hugoDocs/tree/master/content/en (Hugo)
  - https://github.com/obsidianmd/obsidian-help (Obsidian)
  - https://github.com/mdn/content/tree/main/files/en-us (Custom)
  - https://github.com/github/docs/tree/main/content (Next.js)
  - https://github.com/primer/design/tree/main/content (Gatsby, mdx)
  - https://github.com/facebook/docusaurus/tree/main/website (Docuaurus, mdx)
  - https://github.com/reactjs/react.dev/blob/main/src/content/
- [ ] test with node + pnpm

### GUI

- maybe https://tauri.app/
  - https://github.com/tauri-apps/tauri-plugin-fs-watch

### LSP

- https://github.com/microsoft/vscode-languageserver-node/tree/main/server
- https://github.com/ImperiumMaximus/ts-lsp-client

### Links

Input:

- portable markdown links
- wikilinks
- web links

Internally:

- uses file paths e.g. portable markdown links
- always starts with `/`, from the root of the project

Output:

- portable markdown links (maybe relative)
- maybe option to output web links

Read/Write, Source/Root - I need better naming

- read
  - `root` (required) - absolute path. **Naming**: `source`
  - source - folder in root, default `/` e.g. the same as `root`. **Naming**: `files`, `folder`, `path`, `sourcePath`, `markdownFolder`
- write
  - `destination`, any
  - `source` - default the same as read source, but can be changed

## TODO

- [ ] tag graph
  - vizualiztion for hypergraph?
- [ ] better layout for the graph
- [ ] mark broken and ambigous links
- [ ] mark broken anchors (assuming they all link to headings)
- [ ] one file can have more than one link (`aliases`)
- maybe add colors, clustering, etc.

### Other ideas

API

- https://github.com/drizzle-team/drizzle-trpc-zod

frontend

- show markdown as html
- list of files
- graph of files
- query api
- search api
- graph query api or traverse with recursive
- live reload

tui to run SQL in watch mode

## Links

sql parsers (to implement [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)):

- https://github.com/kristianmandrup/chevrotain-mini-sql-lang
- https://nanosql.io/welcome.html
- https://github.com/JavaScriptor/js-sql-parser
- https://github.com/forward/sql-parser
- https://alasql.org/

Incremental parsing:

- https://stereobooster.com/posts/markdown-parsers/#tree-sitter

Multithreading:

- https://github.com/piscinajs/piscina
- https://github.com/poolifier/poolifier

Monorepo:

- https://github.com/changesets/changesets
- https://rushjs.io/
- https://bestofjs.org/projects?tags=monorepo
- https://dev.to/0xahmad/running-both-nodejs-and-bun-apps-in-turborepo-33id
- https://earthly.dev/blog/building-js-monorepo/
- https://lerna.js.org/docs/lerna-and-nx
- https://bit.dev/docs/quick-start/hello-world
- https://themeselection.com/javascript-monorepo-tools/
- https://moonrepo.dev/
- https://2022.stateofjs.com/en-US/libraries/monorepo-tools/
