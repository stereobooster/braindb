# TODO

## Core

- [ ] sort by date
  - store `updated_at` (date in SQL format)
  - config to use git date
  - is git date the same as modifiction of file before commit?
  - local date [`(await stat(absolutePath)).mtime`](https://nodejs.org/api/fs.html#class-fsstats)
  - date from git `execSync('git log -1 --pretty="format:%cI" "${filepath}"');`
- [ ] cache
  - take into account configuration in cache
    - https://github.com/yahoo/serialize-javascript + hash
  - also need to clean up old records (deleted files), otherwise cache will grow indefinetly
    - at start take current timestamp
    - pass it to `addDocument` and store in DB as `revised_at`
    - in the end (`ready`) delete all files that have different `revised_at`
    - strategy can be smatter, than immeaditely delete, for example to preserve cache across git branch switch
  - do I need to take into account `inode`?
- [ ] [frontmatter schema](/notes/schema.md)

## Support Bun

- use [`great.db`](https://www.npmjs.com/package/great.db) instead of `better-sqlite3`
- use [`xxhash-wasm`](https://github.com/jungomi/xxhash-wasm) instead of `@node-rs/xxhash`

## CLI

- [ ] respect `.gitignore` and output folder
  - https://www.npmjs.com/package/parse-gitignore
  - https://git-scm.com/docs/gitignore#_pattern_format
  - https://github.com/paulmillr/chokidar#path-filtering
- copy other files (images)

## Other

- reactivity/memoization
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
  - [electric-sql: Live queries](https://electric-sql.com/docs/usage/data-access/queries#live-queries)
- Faceted search
  - use event listener to produce JSON
  - use `text()` or integrate with pagefind
- [Graphology](https://graphology.github.io/) integration
  - event listener - when node, edge added or node, edge removed
  - show broken links, maybe?
- `html()`
  - use `mdast` to `hast`
  - mark broken links with html class
  - syntax highlighter for code
  - and probably something else
