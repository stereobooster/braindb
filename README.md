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

## Schema

Documents/Nodes:

- path (unique id)
- frontmatter (JSON)
- ast (JSON)
- markdown (text)
- checksum (text, only relevant if persist database on the disk)
- ? url (unique)
- ? processed_ast (text)
- ? processed_markdown (text)
- ? forward links - probably separate table
- ? create_at
- ? updated_at

Links/Edges:

- from (text - path)
- to (text, nullable - path)
- ast (JSON)
- ? properties (JSON)
  - raw_to (text, nullable) - wikilinks and external links
  - label/alias (text from the link)
- ? create_at
- ? updated_at

## TODO

non-watch mode
- resolve links
- backlinks / local graph / global graph
  - output as JSON
  - output as DOT/SVG (graph as dot or any other vizualization)
- update and output markdown

watch mode
- watch files
- tui to run SQL

API
- https://github.com/drizzle-team/drizzle-trpc-zod

frontend
- show markdown as html
- list of files
- graph
- query api
- search api
- graph query api or traverse with recursive

## Other

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
