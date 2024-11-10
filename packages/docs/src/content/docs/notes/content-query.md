---
title: Content query
---

I think to expose querying interface similar to [facets](https://github.com/stereobooster/facets/blob/05e9b0811d5c4ca35fc83fab1c8d2f60e8918599/packages/facets/src/Facets.ts#L138-L150). It is to some extent is limited. But if people need more they can use generated DB directly.

Related:

- https://content.nuxt.com/composables/query-content
- https://github.com/datopian/markdowndb#or-using-markdowndb-nodejs-api-in-a-framework-of-your-choice
- https://pagefind.app/docs/js-api-filtering/#using-compound-filters
- https://testing-library.com/docs/react-testing-library/cheatsheet/#queries
- https://payloadcms.com/docs/queries/overview

## Curently available

```ts
export type DocumentsOtions = {
  slug?: string;
  url?: string;
  frontmatter?: JsonLimitedObject;
  sort?: ["updated_at", SortDirection];
};
documents(options?: DocumentsOtions) {}
```

## Open questions

- SQLite docs
  - https://stackoverflow.com/questions/63651913/is-there-a-method-to-check-if-an-array-includes-one-value-in-sqlite
  - https://www.sqlite.org/lang_expr.html#the_like_glob_regexp_match_and_extract_operators
- Find all docs with couple values for the same field (OR) `frontmater: { date: [X, Y] }`
- Find all docs with tag - `frontmater: { tags: [tag] }`?
  - Find all posts with exactly one tag?
- Find all posts with any tag (OR) - `frontmater: { tags: [tag1, tag2] }`?
  - Find all posts with two tags (AND)?
- Find all docs where field exists in frontmatter - `frontmater: { tags: ... }`?
- Find all docs where field doesn't exist in frontmatter - `frontmater: { tags: null }`?
- Pattern match
  - Find all docs where path starts with (matches some pattern)
  - Find all docs where url starts with (matches some pattern)
  - Find all docs where title matches some pattern

## Alternative approach

Use some kind of DSL, like https://orm.drizzle.team/docs/operators

## Built-in fields vs frontmatter

There are built-in fields: `path`, `url`, `updated_at` (will be added `type`). They don't require schema.

What to do if we have same fields in frontmatter? We can explicitly target those fields with prefix `frontmatter` or `fm`.

- `sort: ["updated_at", "asc"]` will sort by built-in field
- `sort: ["fm.updated_at", "asc"]` will sort by field in frontmatter
- `sort: ["something", "asc"]` will sort by field in frontmatter (because there is no such built-in field)
- `sort: ["something.else", "asc"]` will sort by field `else` nested in object `something` in frontmatter
  - which means we can't use fields with `.` in it. In order to support `.` probably need to intrdouce escape sequence `\.`
