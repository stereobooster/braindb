---
title: New version
draft: true
sidebar:
  order: 1
---

1. **base** - file watcher + SQLite
   1. scans all files
      1. maybe except `.gitignore`
   2. **files** table
      1. `path` _unique_
      2. `slug` may be not unqiue
      3. `updated_at`, `created_at` (preferably from git)
      4. other system data, like `checksum`, `mtime`
      5. `data`
      6. `text` (maybe?) for FTS
2. **plugins** for each file type, for example
   1. **markdown**
      1. frontmatter
      2. AST
   2. **JSON**
      1. data itself
   3. **image**
      1. `width`, `height`
      2. `exif`, `iptc`, `xmp`
      3. [OCR](https://tesseract.projectnaptha.com/) (text, box coordinates)
   4. **audio**
      1. `duration`
      2. `ID3` etc.
      3. [STT](https://www.npmjs.com/search?q=speech-to-text), [pocketsphinx](https://syl22-00.github.io/pocketsphinx.js/)
   5. [JSON canvas](https://jsoncanvas.org/)
   6. no plugin = no data
   7. plugin responsible for
      1. gathering data
      2. gathering parts like tasks, headers, links (markdown)
      3. resolving links
      4. rendering
3. **schema**
   1. glob for files
   2. maybe views
      1. only valid entries
         1. no need for `valid` field
      2. schema for view
   3. typescript schema
   4. name for schema
   5. schema can be applied to any type of file (not just markdown)
4. **API** (content layer)
   1. query (SQL)
      1. opposite to the initial idea of hiding database structure
      2. Kysely?
   2. `render` function
      1. for markdown it renders HTML
         1. data view (like jupyter notebook?)
            1. SQL (datalog, GPQL...)
               1. render as list
               2. render as table
               3. _render as diagram_
            2. [JS eval](https://notes.stereobooster.com/js-eval/)
               1. can be used to stitch any format file with special displays like diagrams, maps etc.
         2. wikilink resolution
            1. `draft`
            2. `valid` - but how if schema optional and there can be more than one schema per file
            3. not unique `slug`?
         3. image wikilink
            1. `![[image]]` - `<img>`
            2. `![[csv]]` - table (also sqlite, parquet, etc)
            3. `![[diagram]]` - image (also canvas)
            4. `![[json]]` - tree
            5. `![[pdf]]` - embeded pdf
            6. `![[audio]]` - embeded audio
            7. `![[youtbe]]` - [1](https://astro-embed.netlify.app/components/youtube/), [2](https://github.com/insin/astro-lazy-youtube-embed/blob/main/YouTube.astro)
         4. image special
            1. `![path?tags]`
         5. other remark, rehype plugins
      2. for diagram it renders image
         1. [maybe link resolution](https://help.obsidian.md/Editing+and+formatting/Advanced+formatting+syntax#Linking+files+in+a+diagram)
   3. event listener
      1. It would be nice to combine query with event listeners ala "live query". Maybe something like, sqlite-CR
5. "theme" - implement full generator from scratch instead of Starlight extension
   1. faceted search
      1. SQLite over HTTP
         1. also good for [big tables](https://observablehq.com/documentation/cells/data-table)
         2. also possible to expose full SQL
      2. pagefind
   2. file-slug as permalink instead of path-slug
      1. and aliases support
   3. Optional title
6. Other
   1. CLI and "studio" doesn't matter. LSP maybe
   2. SQL alternatives are not priority at least for now (unless they work with SQLite out of the box)
   3. deeper integration with diagramming tools
      1. like links (backlinks, wikilinks)
      2. new diagraming tool (parser from scratch, so it would be easy integrate)
