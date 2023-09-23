# mddb

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.1. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Names for the project

- BrainDB - database for your second brain
- Second Brain DB?
- Knowldge Database

## concept

### Links

Input:

- portable markdown links
- wikilinks
- web links

Internally:

- uses file paths e.g. portable markdown links

Output:

- portable markdown links (maybe relative)
- maybe option to output web links

## TODO

- refactor
  - split types
  - 
- [ ] add config
  - persist db?
  - respect `.gitignore` and output folder
    - https://www.npmjs.com/package/parse-gitignore
    - https://git-scm.com/docs/gitignore#_pattern_format
    - https://github.com/thecodrr/fdir/blob/master/documentation.md#excludefunction
    - https://github.com/paulmillr/chokidar#path-filtering
- watch mode
  - [ ] make it abstract, so it can be reused for VSCode extension
- [ ] a way to clean up deleted files
- [ ] tag graph
  - vizualiztion for hypergraph?
- [ ] better layout for the graph
- CLI
  - [ ] ability to pass options: source, destination, db_path, watch mode etc.
- left weblinks for later
- [ ] mark broken and ambigous links
- [ ] mark broken anchors (assuming they all link to headings)
- generate JSON files with
  - https://gephi.org/users/supported-graph-formats/
  - https://networkx.org/documentation/stable/reference/readwrite/index.html
  - https://graphia.app/guide/section3/1_load_graph_data.html
  - https://tulip.labri.fr/site/?q=tlp-file-format
  - https://manual.cytoscape.org/en/stable/Supported_Network_File_Formats.html
  - https://js.cytoscape.org/#notation/elements-json
  - https://apps.cytoscape.org/apps/cyrest
  - https://neo4j.com/docs/bolt/current/bolt/
  - https://neo4j.com/docs/bolt/current/packstream/
  - [ ] backlinks
  - [ ] local graph
  - [ ] global graph
- [ ] one file can have more than one link (`aliases`)
  - maybe add colors, clustering, etc.
- test with
  - https://github.com/gohugoio/hugoDocs/tree/master/content/en (Hugo)
  - https://github.com/obsidianmd/obsidian-help (Obsidian)
  - https://github.com/mdn/content/tree/main/files/en-us (Custom)
  - https://github.com/github/docs/tree/main/content (Next.js)
  - https://github.com/primer/design/tree/main/content (Gatsby, mdx)
  - https://github.com/facebook/docusaurus/tree/main/website (Docuaurus, mdx)
  - https://github.com/reactjs/react.dev/blob/main/src/content/
- https://github.com/cytoscape/cytosnap

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

TUI/CLI:

- https://www.clack.cc/
- https://github.com/helloIAmPau/node-spinner
- https://github.com/tj/commander.js
- https://github.com/vadimdemedes/ink
- https://github.com/vadimdemedes/ink-ui
- https://github.com/SBoudrias/Inquirer.js
- https://blog.logrocket.com/building-typescript-cli-node-js-commander/#why-commander-js
- https://github.com/patorjk/figlet.js
- https://dev.to/wesen/14-great-tips-to-make-amazing-cli-applications-3gp3

TUI/CLI for inspiration:

- https://github.com/charmbracelet/bubbles
- https://github.com/charmbracelet/bubbletea
- https://github.com/ratatui-org/ratatui
- https://github.com/Textualize/textual
- https://github.com/Textualize/frogmouth

sql parsers (to implement [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview)):

- https://github.com/kristianmandrup/chevrotain-mini-sql-lang
- https://nanosql.io/welcome.html
- https://github.com/JavaScriptor/js-sql-parser
- https://github.com/forward/sql-parser
- https://alasql.org/

LSP:

- https://github.com/microsoft/vscode-languageserver-node/tree/main/server
- https://github.com/ImperiumMaximus/ts-lsp-client

Incremental parsing:

- https://stereobooster.com/posts/markdown-parsers/#tree-sitter

Multithreading:

- https://github.com/piscinajs/piscina
- https://github.com/poolifier/poolifier
