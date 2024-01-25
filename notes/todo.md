# TODO

## Core

- CLI
  - use `.braindb` as folder instead of file?
- Remove `toGraphologyJson` from core package
- `text()`
  - [remark-mdx-to-plain-text](https://www.npmjs.com/package/remark-mdx-to-plain-text)
  - [strip-markdown](https://www.npmjs.com/package/strip-markdown)
  - [remark-plain-text](https://www.npmjs.com/package/remark-plain-text)
  - [mdast-util-to-string](https://www.npmjs.com/package/mdast-util-to-string)
- frontmatter
  - `schema`
- [ ] cache https://ziglang.org/download/0.4.0/release-notes.html#Build-Artifact-Caching
  - created_at, updated_at
  - date from git
- [ ] reactivity
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
- [great.db](https://www.npmjs.com/package/great.db) instead of better-sqlite3?

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
  - add arrows to lines
  - alternative layouts (`forceatlas2`, `nooverlap`)
  - event listener - when node, edge added or node, edge removed
  - show broken links, maybe?
- `html()`
  - use `mdast` to `hast`
  - mark broken links with html class
  - syntax highlighter for code
  - and probably something else
