# unsorted notes

## TODO Astro

- tailwind themes
  - https://github.com/gndx/ev0-astro-theme
  - https://github.com/flexdinesh/blogster/tree/main/themes/sleek
  - https://github.com/satnaing/astro-paper
  - https://github.com/chrismwilliams/astro-theme-cactus
  - https://github.com/markteekman/accessible-astro-starter
  - https://github.com/michael-andreuzza/astrosaas
- faceted search
  - [pagefind-instantsearch](https://github.com/stereobooster/pagefind-instantsearch)
  - facets, client side astro component
    - https://github.com/withastro/starlight/blob/main/packages/starlight/components/Search.astro
    - tanstack table + solid?
    - https://daisyui.com/docs/use/
    - https://tanstack.com/table/v8/docs/adapters/solid-table
    - https://ui.shadcn.com/docs/components/data-table
    - https://flowbite.com/blocks/application/advanced-tables/
    - https://tw-elements.com/docs/standard/data/datatables/
    - https://solid-ui-components.vercel.app/docs/components/table
- start off by implementing concrete example and generalize later
  - lists
    - latest (by publish date, or by modification date)
    - alphabetical
    - other
      - time line, graph, calendar
  - sidebar
    - custom
    - file tree
    - facets
      - tags, categories
      - publish date (but why)
      - file tree can be one of filters (hierarchical)
      - custom facets per category
  - standalone pages
    - what about sidebar?
    - Right sidebar
      - ToC
      - backlinks
      - mini graph
  - tags pages
    - do I need them? I can reuse faceted search instead
    - but what about SEO?
- [ ] take any data set
  - sample data https://github.com/analysis-tools-dev/static-analysis/tree/master/data/tools
  - https://github.com/analysis-tools-dev/static-analysis/tree/master/data/tools
  - https://github.com/gohugoio/hugoDocs/blob/master/content/en/functions/data/GetCSV.md
  - https://github.com/mdn/content/blob/main/files/en-us/web/css/-webkit-mask-composite/index.md
  - https://michelebertoli.github.io/css-in-js/ maybe
  - https://github.com/Devographics/entities/tree/main maybe

## Astro search plugins

- [orama](https://docs.oramasearch.com/open-source/plugins/plugin-astro)
  - [uses generated HTML](https://github.com/oramasearch/orama/blob/main/packages/plugin-astro/src/index.ts)
- for pagefind see [starlight](https://github.com/withastro/starlight/)
  - [uses generated HTML](https://github.com/withastro/starlight/blob/d2822a1127c622e086ad8877a07adad70d8c3aab/packages/starlight/index.ts#L61-L72)
- [minisearch](https://github.com/Barnabas/astro-minisearch/)
  - [uses source files](https://github.com/Barnabas/astro-minisearch/blob/main/demo/src/pages/search.json.js#L11-L17)
- [fuse](https://github.com/johnny-mh/blog2/tree/main/packages/astro-fuse)
  - can use [source files](https://github.com/johnny-mh/blog2/blob/main/packages/astro-fuse/src/basedOnSource.ts)
  - and [generated HTML](https://github.com/johnny-mh/blog2/blob/main/packages/astro-fuse/src/basedOnOutput.ts)
- [lunr](https://github.com/jackcarey/astro-lunr)
  - [uses generated HTML](https://github.com/jackcarey/astro-lunr/blob/master/src/index.ts)

## DB + httpvfs

Idea:

- save data in SQLite or DuckDB
- use wasm library on the client side to do full text search and faceting
- use httpvfs to prevent full download of the file
  - https://phiresky.github.io/blog/2021/hosting-sqlite-databases-on-github-pages/
    - https://github.com/phiresky/sql.js-httpvfs
  - https://news.ycombinator.com/item?id=29040120
  - https://www.npmjs.com/package/@degulabs/sqlite_web_vfs
- but DuckDB wasm [size is big](https://github.com/duckdb/duckdb-wasm/discussions/1469)
- it is possible to do faceting with SQL, it is not optimal though
  - https://blog.jooq.org/how-to-calculate-multiple-aggregate-functions-in-a-single-query/
  - https://github.com/lana-k/sqliteviz/wiki/How-to-build-a-pivot-table-in-SQLite

### Core

db instance with API:

- [ ] generate beautiful graph
  - https://github.com/vasturiano/3d-force-graph
  - https://stardustjs.github.io/examples/graph/
  - https://graph.stereobooster.com/notes/Visualisation
  - UI
    - table/list: name, path...
      - sorting, filtering, sql where
    - whole graph
      - select node, highlight edjes
    - detailed view: text with links
    - subgraph
      - filter nodes, like in list view
        - but also show all transitive points
        - depth of adjecent nodes (0 only filtered)
        - toggle: outgoing, incoming, all
      - split view list/graph/detail
- [ ] broken links - show on the graph
- [ ] test with real life example
  - https://github.com/gohugoio/hugoDocs/tree/master/content/en (Hugo)
  - https://github.com/obsidianmd/obsidian-help (Obsidian)
  - https://github.com/mdn/content/tree/main/files/en-us (Custom)
  - https://github.com/github/docs/tree/main/content (Next.js)
  - https://github.com/primer/design/tree/main/content (Gatsby, mdx)
  - https://github.com/facebook/docusaurus/tree/main/website (Docuaurus, mdx)
  - https://github.com/reactjs/react.dev/blob/main/src/content/
- [ ] on ready use DB to re-emit added?
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
- events for adding/deleting edges?
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

### GUI

- maybe https://tauri.app/
  - https://github.com/tauri-apps/tauri-plugin-fs-watch

### LSP

- https://github.com/microsoft/vscode-languageserver-node/tree/main/server
- https://github.com/ImperiumMaximus/ts-lsp-client

## TODO

- [ ] tag graph
  - vizualiztion for hypergraph?
- [ ] better layout for the graph
- [ ] mark broken and ambigous links
- [ ] mark broken anchors (assuming they all link to headings)
- [ ] one file can have more than one link (`aliases`)
- maybe add colors, clustering, etc.

### Other ideas

- [ ] threads (but sqlite single threaded)
  - https://github.com/piscinajs/piscina
  - https://github.com/poolifier/poolifier
  - https://github.com/Vincit/tarn.js
  - https://github.com/SUCHMOKUO/node-worker-threads-pool
  - https://github.com/andywer/threads.js
  - https://github.com/tim-hub/pambdajs

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
