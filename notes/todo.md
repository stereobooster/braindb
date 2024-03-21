# TODO

## Core

- [ ] cache
  - also need to clean up old records (deleted files), otherwise cache will grow indefinetly
    - at start take current timestamp
    - pass it to `addDocument` and store in DB as `revised_at`
    - in the end (`ready`) delete all files that have different `revised_at`
    - strategy can be smatter, than immeaditely delete, for example to preserve cache across git branch switch
  - take into account configuration in cache
    - https://github.com/yahoo/serialize-javascript + hash
  - do I need to take into account `inode`?
- [ ] [frontmatter schema](/notes/schema.md)

## Support Bun

- use [`great.db`](https://www.npmjs.com/package/great.db) instead of `better-sqlite3`
- use [`xxhash-wasm`](https://github.com/jungomi/xxhash-wasm) instead of `@node-rs/xxhash`
- what about `@napi-rs/simple-git`?

## CLI

- [ ] respect `.gitignore` and output folder
  - https://www.npmjs.com/package/parse-gitignore
  - https://git-scm.com/docs/gitignore#_pattern_format
  - https://github.com/paulmillr/chokidar#path-filtering
- copy other files (images)

## Other

- Faceted search
  - use event listener to produce JSON
  - use `text()` or integrate with pagefind
- Extract TODOs
  - separate table
  - path to original document, ast, text?, checked(true/false)
  - query interface
- Extract Headings
  - either need to allow to pass remark plugins (`import { rehypeHeadingIds } from "@astrojs/markdown-remark";`) or pass slug function
  - separate table
  - path to original document, ast?, text, level
  - use for link resolution
- reactivity/memoization
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
  - [electric-sql: Live queries](https://electric-sql.com/docs/usage/data-access/queries#live-queries)
- [Graphology](https://graphology.github.io/) integration
  - event listener - when node, edge added or node, edge removed
  - show broken links, maybe?
- `html()`
  - use `mdast` to `hast`
  - mark broken links with html class
  - syntax highlighter for code
  - and probably something else
