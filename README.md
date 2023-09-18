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

## TODO

- [ ] generate markdown files with resolved links
  - find away to effectively update AST
  - https://github.com/orgs/syntax-tree/repositories?page=2&type=all
  - https://github.com/syntax-tree/unist-util-lsp#topointlspposition
  - https://github.com/syntax-tree/unist#point
  - https://github.com/GenerousLabs/unist-util-reduce
  - https://github.com/syntax-tree/unist-util-index
  - https://github.com/unicorn-utterances/unist-util-replace-all-between
- [ ] mark broken and ambigious links
- [ ] mark broken anchors (assuming they all link to headings)
- [ ] a way to clean up deleted files
- generate JSON files with
  - [ ] backlinks
  - [ ] local graph
  - [ ] global graph
- CLI
  - [ ] ability to pass options: source, destination, db_path, watch mode etc.
- watch mode
  - [ ] watch files with chokidar
  - [ ] on file deletion remove all links to it
  - [ ] on file update regenerate all links to it and file itself
  - [ ] on file insert
- [ ] tag graph
  - vizualiztion for hypergraph?
- [ ] better layout for the graph
  - maybe add colors, clustering, etc.
- test with
  - https://github.com/gohugoio/hugoDocs/tree/master/content/en (Hugo)
  - https://github.com/obsidianmd/obsidian-help (Obsidian)
  - https://github.com/mdn/content/tree/main/files/en-us (Custom)
  - https://github.com/github/docs/tree/main/content (Next.js)
  - https://github.com/primer/design/tree/main/content (Gatsby, mdx)
  - https://github.com/facebook/docusaurus/tree/main/website (Docuaurus, mdx)
  - https://github.com/reactjs/react.dev/blob/main/src/content/

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
