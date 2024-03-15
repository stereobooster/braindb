# TODO

## Core

- [ ] sort by date
  - local date [`(await stat(absolutePath)).mtime`](https://nodejs.org/api/fs.html#class-fsstats)
  - date from git `execSync('git log -1 --pretty="format:%cI" "${filepath}"');`
- [ ] cache
  - take into account configuration in cache
  - also need to clean up old records (deleted files), otherwise cach will grow indefinetly
  - do I need to take into account `inode`?
- [ ] frontmatter
  - `schema`
- [ ] reactivity
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable

## Support Bun

- use [`great.db`](https://www.npmjs.com/package/great.db) instead of `better-sqlite3`
- use [`xxhash-wasm`](https://github.com/jungomi/xxhash-wasm) instead of `@node-rs/xxhash`

## CLI

- [ ] a way to clean up deleted files
  - mark all new files (`created_at`) than delete from DB and emit events
- [ ] respect `.gitignore` and output folder
  - https://www.npmjs.com/package/parse-gitignore
  - https://git-scm.com/docs/gitignore#_pattern_format
  - https://github.com/paulmillr/chokidar#path-filtering
- copy other files (images)

## Other

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
