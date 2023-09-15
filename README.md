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
- [ ] convert graph to `svg` with `graphviz`
- [ ] mark broken and ambigious links
- [ ] mark broken anchors (assuming they all link to headings)
- [ ] optimize resolution algorithm with `join`
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

- https://github.com/remarkjs/remark-validate-links/blob/main/lib/find/find-references.js#L73-L108
- https://github.com/jackyzha0/hugo-obsidian/blob/master/util.go

https://github.com/tj/commander.js
https://github.com/vadimdemedes/ink
https://github.com/SBoudrias/Inquirer.js
https://blog.logrocket.com/building-typescript-cli-node-js-commander/#why-commander-js
https://github.com/patorjk/figlet.js
https://dev.to/wesen/14-great-tips-to-make-amazing-cli-applications-3gp3

https://github.com/microsoft/vscode-languageserver-node/tree/main/server
https://github.com/ImperiumMaximus/ts-lsp-client

https://stereobooster.com/posts/markdown-parsers/#tree-sitter

https://github.com/piscinajs/piscina
https://github.com/poolifier/poolifier

https://www.npmjs.com/package/@leafac/sqlite
https://github.com/tc39/proposal-binary-ast
