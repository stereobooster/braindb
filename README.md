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

- Second Brain DB?

## TODO

- [ ] generate graph
- [ ] convert graph to `dot` format
- [ ] convert graph to `svg` with [graphviz](https://github.com/hpcc-systems/hpcc-js-wasm)
  - [href](https://graphviz.org/docs/attrs/href/) or [URL](https://graphviz.org/docs/attrs/URL/)
- [ ] mark broken and ambigious links
- [ ] mark broken anchors (assuming they all link to headings)
- [ ] optimize resolution algorithm with SQL `join`
- [ ] generate markdown files with resolved links
- generate JSON files with
  - [ ] backlinks
  - [ ] local graph
  - [ ] global graph
- watch mode
  - [ ] watch files with chokidar
  - [ ] on file deletion remove all links to it
  - [ ] on file update regenerate all links to it and file itself

### Other

tui to run SQL in watch mode

API
- https://github.com/drizzle-team/drizzle-trpc-zod

frontend
- show markdown as html
- list of files
- graph
- query api
- search api
- graph query api or traverse with recursive

## Links

sql parsers
- https://github.com/kristianmandrup/chevrotain-mini-sql-lang
- https://nanosql.io/welcome.html
- https://github.com/JavaScriptor/js-sql-parser
- https://github.com/forward/sql-parser
- https://alasql.org/

CLI:
- https://github.com/tj/commander.js
- https://github.com/vadimdemedes/ink
- https://github.com/SBoudrias/Inquirer.js
- https://blog.logrocket.com/building-typescript-cli-node-js-commander/#why-commander-js
- https://github.com/patorjk/figlet.js
- https://dev.to/wesen/14-great-tips-to-make-amazing-cli-applications-3gp3

LSP:
- https://github.com/microsoft/vscode-languageserver-node/tree/main/server
- https://github.com/ImperiumMaximus/ts-lsp-client

Incremental parsing:
- https://stereobooster.com/posts/markdown-parsers/#tree-sitter

Multithreading:
- https://github.com/piscinajs/piscina
- https://github.com/poolifier/poolifier
