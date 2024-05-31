---
title: BrainDB
tableOfContents: false
---

:::caution
BrainDB docs are not ready. For now it's a bunch of notes
:::

## Components

- [ ] remark-dataview
  - there is PoC, need to move to this repo and extend with [full DQL parser](https://github.com/blacksmithgu/obsidian-dataview/blob/master/src/query/parse.ts)
- [ ] [[remark-wiki-link]]
- [ ] notes
  - write note about [[metadata]] (frontmatter) in different SSG
  - sort and rewrite old notes
- [x] core
  - [ ] print warning only once `Warning: Error: Failed to get commit for`
  - [ ] improve query interface
  - [ ] extract headers
  - [ ] frontmatter schema
  - [ ] allow to pass remark/rehype plugins?
- [ ] Astro integration
  - Astro plugin that will provide BrainDB instance
  - maybe will install remark plugins
  - maybe will provide Astro components
- [ ] documentation
  - need to clearly describe what is it and how it can be used
  - document options and API
  - provide demos
  - check grammar
  - publish online
- [ ] demos
  - obsidian
  - maybe Next.js

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
