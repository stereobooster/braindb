---
title: Schema
draft: true
---

Main source of inspiration - [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

Related:

- https://contentlayer.dev/docs/sources/files/mapping-document-types-bf100a10

Basic idea:

- folder represents table/collection
- folder name represents table name, or tag in disjoint union
- file represents row/document/tupple
- file path represents global unique ID
- slug represents per table unique ID

For each selected folder we can define schema.

## Error behaviour

What to do if there is an error in one of documents?

- Report error
- then either:
  - block whole database until error would be resolved
  - exclude document with error from the index (until error would be resolved)

## Extra fields

Options:

- allow fields that are not in schema
- **remove all extra fields** that are not present in schema
  - optionally print warning when that happens

### Shall schema be optional?

- On one side it is easier to get started if schema is optional
- On the other side one can always use `z.any()`
- Astro uses convention of one schema per top level folder. But in our case this is not convinient
  - Use one schema for root, with default type `undefined` and default schema `z.any()`
  - top level folder = type, but optional. If there is no config it would use default one (from root)
  - shall we allow arbitrary paths (glob) for schemas
    - what to do if more than one schema matches for file? Throw an error?

## Typescript

[Runtime type validators](https://stereobooster.com/posts/runtime-type-validators/)

Let's say we have collections:

```ts
const A = defineCollection({
  type: "A",
  schema: z.object({
    a: z.string(),
  }),
});

const B = defineCollection({
  type: "B",
  schema: z.object({
    b: z.number(),
  }),
});

export const collections = {
  A: A,
  B: B,
};
```

Then `frontmatter()` can be either:

```ts
{
    a?: string,
    b?: number,
}
```

or:

```ts
{
  A?: { a: string },
  B?: { b: number },
}
```

or:

```ts
{ type: 'A', A: { a: string } } |
{ type: 'B', B: { b: number } }
```

theoretically it could also be:

```ts
{ type: 'A',  a: string } |
{ type: 'B', b: number }
```

But in this case field we can't use field `type` in orginial schemas.

### Class

```ts
class Document<T, F> {
  type(): T {}
  frontmatter(): F {}
}
```

and default can be

```ts
new Document<undefined, any>();
```

## SQL

for trivial types:

```
query({"frontmatter.a": 1})
```

would be translated to

```sql
SELECT * FROM documents WHERE frontmatter ->> '$.a' = 1;
```

But for arrays we may need to use `json_each()`:

```
query({"frontmatter.tag": "js"})
```

would be translated to something like this:

```sql
SELECT * FROM documents, json_each(frontmatter -> '$.tag') WHERE
WHERE json_each.value = 'js';
```

Also need to check if there are issue with quoting.

## Indexing, sorting, faceting

```ts
type A = {
  a: string;
  c: number;
  d: Array<number>;
};

type B = {
  b: number;
  c: number;
  d: Record<string, string>;
};
```

- `a` and `b` - do not conflict, so we can simply put `NULL` (in SQL terms) or `undefined` (in JS terms) where they miss. Related: sorting can provide options for `NULL FIRST`, `NULL LAST`
- `c` - present in both types, but do not conflict. So there are no issues
- `d` - conflicts. Even if we can build index for this mixed type, it is unclear how to sort mixed types. We can convert everything to string and sort, but would it make sense?

The simplest solution: **do not allow to filter, sort, facet by mixed type columns**.

### Indexes

For inspiration:

- [SQLite + Roaring Bitmaps](https://github.com/oldmoe/roaringlite)
- [pgfaceting](https://github.com/cybertec-postgresql/pgfaceting) + [pg_roaringbitmap](https://github.com/ChenHuajun/pg_roaringbitmap) + [pglite](https://github.com/electric-sql/pglite/issues/18)
- maybe https://www.sqlite.org/expridx.html
- https://dadroit.com/blog/json-querying/#section-6-how-to-use-indexing-for-query-optimization-over-json-data-in-sqlite
- [LiteIndex: Memory-Efficient Schema-Agnostic Indexing for JSON documents in SQLite](https://www.researchgate.net/publication/348889953_LiteIndex_Memory-Efficient_Schema-Agnostic_Indexing_for_JSON_documents_in_SQLite)

## Querying

One of options for querying data is to expose [Drizzle ORM](https://orm.drizzle.team/docs/rqb). But this exposes implementation details.

[](./content-query.md)
