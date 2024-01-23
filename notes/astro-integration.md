# Astro integration

Ideas from discussions:

- https://github.com/withastro/starlight/discussions/1113
- https://github.com/withastro/starlight/discussions/1239
- https://github.com/withastro/starlight/discussions/946
- https://github.com/withastro/roadmap/discussions/688
- https://github.com/withastro/roadmap/discussions/769
- https://github.com/withastro/roadmap/discussions/434
- https://github.com/withastro/roadmap/discussions/759
- https://github.com/withastro/roadmap/discussions/736
- https://github.com/withastro/roadmap/discussions/739
- https://github.com/withastro/roadmap/discussions/424
- https://github.com/withastro/roadmap/discussions/704
- https://github.com/withastro/roadmap/discussions/696
- https://github.com/withastro/roadmap/discussions/689
- https://github.com/withastro/roadmap/discussions/686
- https://github.com/withastro/roadmap/discussions/687
- https://github.com/withastro/roadmap/discussions/551
- https://github.com/withastro/roadmap/discussions/423
- https://github.com/withastro/roadmap/discussions/505
- https://github.com/withastro/roadmap/discussions/487
- https://github.com/withastro/roadmap/discussions/470
- https://github.com/withastro/roadmap/discussions/457
- https://github.com/withastro/roadmap/discussions/437
- https://github.com/withastro/roadmap/discussions/334
- https://github.com/withastro/roadmap/discussions/76

## Combo without link resolving

If there is no need to rewrite links, `core` can be configured to read files from `src/content` and can be acessed to get data, like backlinks etc.

The same time Astro would work without any changes.

This is the **easiest integration**. Can be added to any existing Astro website.

## CLI-based

see: [demo-astro-cli](/packages/demo-astro-cli/README.md)

- markodwn files are in `/some/folder`
- braindb (CLI) in watch mode writes files to `/src/content`
- Astro content reads files from `/src/content`

Braindb responsible for:

- backlinks
- resolving links (Wiki-links or PML)
- finding broken links

Astro-content responsible for:

- Rendering
  - including processing MDX

### Passing data

Braindb except wriiting markdown files generates additional data, like backlinks. There are two ways to pass this data to Astro (in the given context):

- frontmatter (see `transformFrontmatter`)
- separate JSON (or YAML, TOML) file
  - for example if we write markdown files to `/src/content/notes/<path>.md`, we can write data files to `/src/content/notes/<path>.json`
    - there would be function to transform path data files
    - and function to generate content for data `(Document) => JSON`

## Core-based

see: [demo-astro-core](/packages/demo-astro-core/README.md)

- braindb (core) fully replaces Astro-content

### Problems

- It's not trivial task to **support MDX** the same way as Astro does
- Pages does not re-render on content change
  - though this can be implemented with Vite plugin. Vite internally uses chokidar (the same as braindb)

## Combo with link resolving

Basically the same setup as `CLI-based`, except that data is not writen to files, but can be accessed through `core`:

- braindb in watch mode writes files to `/src/content`
- and also braindb can be accessed programatically to get more data
