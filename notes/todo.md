# TODO

## Core
- [ ] Extract Tasks (e.g. `- [ ] TODO`)
  - separate table
  - path to original document, ast, text?, checked(true/false)
  - query interface
- [ ] Extract Headings
  - either need to allow to pass remark plugins (`import { rehypeHeadingIds } from "@astrojs/markdown-remark";`) or pass slug function
  - separate table
  - path to original document, anchor (aka id, aka slug), ast?, text, level
  - use for link resolution
- [ ] [frontmatter schema](/notes/schema.md)

## Performance

- [ ] sql prepared statements
- [ ] [parallel processing](./parallel.md)
- [incremental parsing](https://parsing.stereobooster.com/other/incremental-parsers/)
  - https://github.com/lezer-parser/markdown
  - https://github.com/tree-sitter-grammars/tree-sitter-markdown
  - https://github.com/ikatyang/tree-sitter-markdown
  - https://ohmjs.org/ + PEG grammar

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

- cache
  - take into account versions of libraries?
  - do I need to take into account `inode`?
  - BigInt for hash maybe?
    - `UNSIGNED BIG INT`
    - https://orm.drizzle.team/docs/column-types/sqlite#bigint
    - https://github.com/WiseLibs/better-sqlite3/blob/master/docs/integer.md#the-bigint-primitive-type
- yaml
  - https://github.com/biojppm/rapidyaml
  - https://philna.sh/blog/2023/02/02/yaml-document-from-hell-javascript-edition/
- Faceted search
  - Astro JSON route with faceted data
  - Pagefind integration either
    - generate JSON to build index
      - `text()`
    - Or [build index based on generated html](https://github.com/withastro/starlight/blob/d2822a1127c622e086ad8877a07adad70d8c3aab/packages/starlight/index.ts#L61-L72)
  - Update facets lib to support pagefind
  - Integrate InstantSearch UI
- reactivity/memoization
  - [materialite](https://github.com/vlcn-io/materialite)
  - [signals](https://preactjs.com/guide/v10/signals/)
  - maybe [rxdb](https://rxdb.info) Observable
  - [electric-sql: Live queries](https://electric-sql.com/docs/usage/data-access/queries#live-queries)
- [Graphology](https://graphology.github.io/) integration
  - event listener - when node, edge added or node, edge removed
  - show broken links, maybe?
  - PageRank, clustering (related)
- `html()`
  - use `mdast` to `hast`
  - mark broken links with html class
  - syntax highlighter for code
  - and probably something else
- [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview):
  - https://github.com/kristianmandrup/chevrotain-mini-sql-lang
  - https://nanosql.io/welcome.html
  - https://github.com/JavaScriptor/js-sql-parser
  - https://github.com/forward/sql-parser
  - https://alasql.org/
