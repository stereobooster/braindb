# Architecture notes

## Link types

Links by type of href:

- web links
  - internal, like `/something/slug`
  - external, like `https://domain/something`
- Portable markdown links (PML)
  - like `/folder/name.md`
- Wikilinks, like `[[slug]]`
  - short slug, like one word or phrase (without slashes). Example: wikipedia, Obsidian
  - long slug (path with slashes), like `folder/name`. Example: Astro, Foam

Links by type of markup:

- Markdown link `[name](href)` or `[name](<href>)`
- HTML link `<a href="href">name</a>`
- Wikilink `[[slug]]` or `[[slug|name]]`
- Reference links `[name][def]` and later `[def]: https://href`

|           | web | PML | wiki |
| --------- | --- | --- | ---- |
| markdown  | +   | +   |      |
| HTML      | +   |     |      |
| wiki      |     |     | +    |
| Reference | +   | +   |      |

## Links vs input/output

|           | Input (md) | Output (md) | Output (html) |
| --------- | ---------- | ----------- | ------------- |
| Web-link  | + (1)      | + (2)       | +             |
| PML       | + (3)      | + (4)       |               |
| Wiki-link | + (5)      |             |               |

- (1) `generateUrl` - `(filePath, frontmatter_1) => webPath`
- (2) nothing for now, unless there is a need in function which would map from one type of web pathes to another
- (3) `source` - root folder against which to resolve PML
- (4) `destinationPath` - `(filePath) => filePath`
- (5) ? - `(filePath, frontmatter_1) => slug`
  - `Astro`: file path (without extension)
  - `Obsidian`: file name (without extension)
  - `Foam`: file name or partial file path (without extension)
  - `Hugo`: file name (without extension), also allows to set custom slug in frontmatter
- (6) ? - `(filePath, frontmatter_1) => frontmatter_2`
  - conversion happens as the last step before generating markdown, so "generated" fields are not stored in the DB
  - can be used, for example, to store backlinks in frontmatter
  - or any other generated fields, such as `title` (when converted from Obsidian), `url` or `slug`

## Schema (for frontmatter)

It is open question about how to map schema to files. One of options is schema per folder:

- the same way as Astro does
- plus one can thought of it as database tables - each folder in the root is a table (page type)

If schemas do not have same fields or same-named fields have the same type - it would be possible to merge all schemas into one, for faceted search (missing fields would become nullable).

There can be one schema per root folder (to make things easier).

No schema can be treated as:

- pass everything as is
- pass nothing

## DB

### Document

- `id` - number (autoincrement) for simplicity
- `path` - string, alternative key (unique)
- `frontmatter` - JSON-column, optionally can be validated with Schema
  - `title` - can be generated from slug or file name (TODO: make it optional, but it is required for wikilinks?)
- `content` - either string or parse tree (as JSON)
- `slug` - string, generated from the path or taken from frontmatter. Not unique at DB level, but will warn
- `url` - string, generated from slug, path and maybe type
- `type` - string, optional. Can be used to match different Schemas

### Link

- `from` - string. "foreign key" - `document.path`
- `position` - number. `from + position` - unique
- `to` - string, null. "foreign key" - `document.path`
- `to_path` - string, null.
- `to_slug` - string, null.
- `to_url` - string, null.
- `to_anchor` - string, null.
- `metadata` - maybe text of the link, maybe parsed fragment

`to` - initally null. `to_path`, `to_slug`, `to_url` - are extracted from markup of the link and only used to match document, correspondingly `link.to_path = document.path`, `link.to_slug = document.slug`, `link.to_url` = `document.url`. If document found - `to` field updated with `path`.
