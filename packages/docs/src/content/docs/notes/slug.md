---
title: Slug
---

## How to form slug for root pages?

Root pages can be `index.md`, `index.mdx` (or `readme.md`, `readme.mdx` in GitHub).

| path             | option 1 | option 2 | option 3     | url-path |
| ---------------- | -------- | -------- | ------------ | -------- |
| `/index.md`      | `/`      | `index`  | `index`      | `/`      |
| `/some/index.md` | `some`   | `index`  | `some/index` | `/some/` |
| `/some.md`       | `some`   | `some`   | `some`       | `/some/` |
| `/index.mdx`     | `/`      | `index`  | `index`      | `/`      |
| `/Index.md`      | `/`      | `Index`  | `Index`      | `/`      |

- slug generation is customizable, so if somebody needs any specific behaviour they can implement it
- **option 1** is the current default behaviour
- I think slug should be case sensitive
- Only path gauranteed to be unique. Slugs and urls can repeat - maybe create a function to check if there are duplicates `SELECT count() FROM documents GROUP BY slug HAVING count() > 1`
- do we need option to match slug case insentively?
- do we need option to match against more than slug if there is ambiguity, like `index`, `other/index`, `some/other/index`?
