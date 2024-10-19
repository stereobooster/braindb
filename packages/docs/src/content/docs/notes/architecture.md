---
title: Architecture
sidebar:
  order: 2
tags: [idea, architecture]
---

## Overview

```vizdom
digraph { 
  rankdir=LR
  node[shape=rect]
  subgraph cluster_0 {
    label="File watcher"
    fwc[label=Add]
    fwu[label=Change]
    fwd[label=Unlink]
    fwr[label=Ready]
    fwe[label=Error]
  }

  subgraph cluster_1 {
    label=Storage
    dbi[label=Insert]
    dbu[label=Update]
    dbd[label=Delete]
  }
  
  rl[label="Resolve links"]
  
  subgraph cluster_2 {
    label="Event emitter"
    eec[label=Create]
    eeu[label=Update]
    eed[label=Delete]
    eer[label=Ready]
  }

  fwc -> Parse -> dbi -> rl -> eec
  fwu -> Parse -> dbu -> rl -> eeu
  fwd -> dbd -> rl -> eed
  fwr -> rl -> eer
}
```

### System Overview

The system consists of the following parts:

- **File watcher**: Watches markdown files on the disk and emits events for each change.
  - Currently, it uses [`chokidar`](https://www.npmjs.com/package/chokidar).
  - Alternatively, it can use:
    - [`createFileSystemWatcher`](https://code.visualstudio.com/api/references/vscode-api#workspace.createFileSystemWatcher) in the VSCode environment.
    - [`tauri-plugin-fs-watch`](https://github.com/tauri-apps/tauri-plugin-fs-watch) in the Tauri environment.
- **Parser**: Parses markdown files to extract links and frontmatter.
  - Currently, it uses [`remark`](https://github.com/remarkjs/remark).
  - Alternatively, it can use:
    - [`tree-sitter`](https://github.com/tree-sitter/tree-sitter) because it supports incremental parsing.
    - [`markdown-rs`](https://github.com/wooorm/markdown-rs) because it is written in Rust.
    - [`lezer-parser/markdown`](https://github.com/lezer-parser/markdown) because it supports incremental parsing.
    - [others](https://stereobooster.com/posts/markdown-parsers/).
- **Storage**: Used as a cache to avoid reparsing files and as a query engine to resolve links and find backlinks, etc.
  - Currently, it uses [`sqlite`](https://www.sqlite.org/index.html) plus:
    - [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3). Alternatively, it can use [`great.db`](https://www.npmjs.com/package/great.db).
    - [`Drizzle ORM`](https://orm.drizzle.team/).
  - Alternatively, it can use:
    - [`cozodb`](https://docs.cozodb.org) because it supports graph queries with [datalog](https://docs.cozodb.org/en/latest/tips.html).
    - [`kuzudb`](https://kuzudb.com) because it supports graph queries with [cypher](https://kuzudb.com/docusaurus/cypher/query-clauses/match).
- **Event emitter**: Passes further events after they are processed.
  - Currently, it uses [`mitt`](https://github.com/developit/mitt) as the simplest possible option.

## Interfaces

### Implementation Details

Some implementation details are hidden so that changes can be made without affecting end users.

For example, it hides SQLite storage so that it would be possible to switch from SQLite to `cozodb`. On the other hand, this means that a query interface needs to be implemented (`select`, `order by`, `where`, `limit`, etc.). This is currently not implemented. I plan to reuse a query interface similar to [`facets`](https://github.com/stereobooster/facets/blob/main/packages/facets/src/Facets.ts#L138-L150).

### Events

Essentially, it would be sufficient to expose the content as a graph database. However, it uses a file watcher and emits events. This is done so that the core library could be used as an LSP or in "development mode" without needing to restart the server.

Currently, the system emits events only for documents (nodes). I am considering adding events for links (edges).

## Paths

- `root`: Root of the project.
  - Used to convert absolute paths of files to relative paths before storing in the DB so that the DB would be portable.
  - Also used as the root for PML.
  - Typically, this would be the same folder where `.git` is stored.
  - Probably would be `cwd` from where the CLI runs and where `.braindb` is stored.
- `source`: Folder relative to the root.
  - There can be many sources.
  - For each source, we can attach a schema, similar to how Astro does it.
  - Astro limits the depth of the source folder to 1, which allows it to be used as a "type."
- `filepath`:
  - The one stored in the DB, which is relative to the root.
  - **But what about those passed to functions?** Should they be relative to `source`?

All paths start with `/` and end with a non-`/`. Web paths start with `/` and end with `/`.

## Link Types

Links are categorized by the type of href:

- Web links:
  - Internal, like `/something/slug`.
  - External, like `https://domain/something`.
- Portable markdown links (PML):
  - Like `/folder/name.md`.
- Wikilinks:
  - Short slug, like one word or phrase (without slashes). Example: Wikipedia, Obsidian.
  - Long slug (path with slashes), like `folder/name`. Example: Astro, Foam.

Links are categorized by the type of markup:

- Markdown link: `[name](href)` or `[name](<href>)`.
- HTML link: `<a href="href">name</a>`.
- Wikilink: `[[slug]]` or `[[slug|name]]`.
- Reference links: `[name][def]` and later `[def]: https://href`.

|           | Web | PML | Wiki |
| --------- | --- | --- | ---- |
| Markdown  | +   | +   |      |
| HTML      | +   |     |      |
| Wiki      |     |     | +    |
| Reference | +   | +   |      |

## Links vs Input/Output

|           | Input (md) | Output (md) | Output (html) |
| --------- | ---------- | ----------- | ------------- |
| Web link  | + (1)      | + (2)       | +             |
| PML       | + (3)      | + (4)       |               |
| Wiki link | + (5)      |             |               |

- (1) `url`: `(filePath, frontmatter_1) => webPath`.
- (2) Nothing for now, unless there is a need for a function that maps from one type of web paths to another.
- (3) `root`: Root folder against which to resolve PML.
- (4) `transformPath`: `(filePath) => filePath`.
- (5) `slug`: `(filePath, frontmatter_1) => slug`.
  - `Astro`: File path (without extension).
  - `Obsidian`: File name (without extension).
  - `Foam`: File name or partial file path (without extension).
  - `Hugo`: File name (without extension), also allows setting a custom slug in frontmatter.
- (6) `transformFrontmatter`: `(filePath, frontmatter_1) => frontmatter_2`.
  - Conversion happens as the last step before generating markdown, so "generated" fields are not stored in the DB.
  - This can be used, for example, to store backlinks in frontmatter or any other generated fields, such as `title` (when converted from Obsidian), `url`, or `slug`.

## Schema (for Frontmatter)

It is an open question how to map a schema to files. One option is to use one schema per folder:

- The same way as Astro does.
- One can think of it as database tables—each folder in the root is a table (page type).

If schemas do not have the same fields, or if the same-named fields have the same type, it would be possible to merge all schemas into one for faceted search (missing fields would become nullable).

There can be one schema per root folder (to simplify things).

The absence of a schema can be treated as:

- Pass everything as is.
- Pass nothing.

## Database

### Document

- `id`: Number (autoincrement) for simplicity.
- `path`: String, alternative key (unique).
- `frontmatter`: JSON-column, optionally can be validated with a schema.
  - `title`: Can be generated from the slug or file name (TODO: make it optional, but it is required for wikilinks).
- `content`: Either string or parse tree (as JSON).
- `slug`: String, generated from the path or taken from frontmatter. Not unique at the DB level but will give a warning.
- `url`: String, generated from slug, path, and maybe type.
- `type`: String, optional. Can be used to match different schemas.

### Link

- `from`: String. "Foreign key" - `document.path`.
- `position`: Number. `from + position` - unique.
- `to`: String, null. "Foreign key" - `document.path`.
- `to_path`: String, null.
- `to_slug`: String, null.
- `to_url`: String, null.
- `to_anchor`: String, null.
- `metadata`: Possibly text of the link, possibly parsed fragment.

`to` is initially null. `to_path`, `to_slug`, and `to_url` are extracted from the markup of the link and are only used to match the document. Correspondingly, `link.to_path = document.path`, `link.to_slug = document.slug`, and `link.to_url = document.url`. If the document is found, the `to` field is updated with the `path`.
