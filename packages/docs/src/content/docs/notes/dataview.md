---
title: dataview
draft: true
---

## TODO

- simplest views are
  - [x] table (any number of columns)
    - [ ] align columns based on type (string left, numbers right)
  - [x] list
    - [x] `dv_task`
      - is it ok that it depends on `ast`?
        - [x] if it depends on `tasks` table I can as well put default columns `tasks.ast`, `tasks.checked`
    - [ ] potential issue with first column used for grouping
  - [ ] nested-list (any number of columns)
- [x] handle `*`
- [x] update readme
- [ ] maybe shortcut like `dv('updated_at')` - if `updated_at` exists in frontmatter than take it, otherwise use built-in value
  - I would need to replace this in `WHERE`, `ORDER` and other places
- [ ] maybe rename `dv_link` to `dv_anchor` or `dv_page` ... because there is table `links` which may be confusing
- [ ] add tests
- [ ] shall I rename tables and columns before publishing?
- [ ] Backlinks?
  - I would need special function which would return path of current page `dv_path()`

## Examples

### Alphabetical index

```dataview list root_class=column-list
SELECT upper(substr(frontmatter ->> '$.title', 1, 1)), dv_link()
FROM documents
WHERE frontmatter ->> '$.draft' IS NULL OR frontmatter ->> '$.draft' = false
ORDER BY frontmatter ->> '$.title'
LIMIT 2;
```

### Recently changed

```dataview list root_class=column-list
SELECT date(updated_at / 1000, 'unixepoch'), dv_link()
FROM documents
WHERE frontmatter ->> '$.draft' IS NULL OR frontmatter ->> '$.draft' = false
ORDER BY updated_at DESC
LIMIT 2;
```

### Task list

```dataview list
SELECT dv_link(), dv_task()
FROM tasks JOIN documents ON documents.path = tasks.from
WHERE frontmatter ->> '$.draft' IS NULL OR frontmatter ->> '$.draft' = false
ORDER BY updated_at DESC, path, tasks.start
LIMIT 2;
```

### Tags list

```dataview list root_class=column-list
SELECT tags.value as tag, dv_link()
FROM documents, json_each(frontmatter, '$.tags') tags
WHERE frontmatter ->> '$.draft' IS NULL OR frontmatter ->> '$.draft' = false
ORDER BY tag
LIMIT 2;
```

## SQL parsers

- https://github.com/taozhi8833998/node-sql-parser
  - dialect: a lot, parser: pegjs, typescript
- https://github.com/JavaScriptor/js-sql-parser
  - dialect: MySQL, parser: jison
- https://alasql.org/
  - dialect: ?, parser: jison
- https://github.com/launchql/pgsql-parser
  - dialect: PostgreSQL, parser: ?
- https://github.com/TypeFox/langium-sql/blob/main/packages/langium-sql/
  - no idea how to use it as simple parser
- https://nanosql.io/welcome.html
- https://github.com/kristianmandrup/chevrotain-mini-sql-lang
  - https://chevrotain.io/docs/tutorial/step3b_adding_actions_embedded.html#sql-grammar
  - https://www.npmjs.com/package/rhombic
  - last commit 5 years ago
- https://github.com/forward/sql-parser
  - last commit 9 years ago
- https://github.com/DerekStride/tree-sitter-sql
  - https://github.com/lezer-parser/import-tree-sitter
