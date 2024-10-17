# Demo: Astro integration

## Build fails

```sh
pnpm build
Build failed in 970ms
[commonjs--resolver] ../../node_modules/.pnpm/@node-rs+xxhash-darwin-x64@1.7.0/node_modules/@node-rs/xxhash-darwin-x64/xxhash.darwin-x64.node (1:0): Unexpected character '�' (Note that you need plugins to import files that are not JavaScript)
file: /node_modules/.pnpm/@node-rs+xxhash@1.7.0/node_modules/@node-rs/xxhash/index.js:1:0
1: �������__TEXT�__text...
```

There are several related issues reported in Vite:

- https://github.com/vitejs/vite/issues/5688
- https://github.com/vitejs/vite/issues/14289
- https://github.com/vitejs/vite/issues/16293

**Workaround** use `@braindb/core` from npm instead of local version (`"@braindb/core": "workspace:*"`)

## TODO

Those are old TODOs. A lot of them covered in https://astro-digital-garden.stereobooster.com/

- Layout: navbar, footer, main, sidebar
- navbar
  - [dark mode switcher](https://www.kevinzunigacuellar.com/blog/dark-mode-in-astro/)
  - [pagefind component](https://blog.otterlord.dev/posts/astro-search/)
- other
  - @astrojs/sitemap
  - seo
	- https://www.npmjs.com/package/@astrolib/seo
	- https://www.npmjs.com/package/astro-seo
- components
- https://github.com/natemoo-re/astro-icon
  - https://github.com/markteekman/accessible-astro-components#usage
  - https://github.com/delucis/astro-embed/tree/main/packages/astro-embed-youtube#readme
  - https://github.com/felix-berlin/astro-breadcrumbs
- tailwind themes
  - https://github.com/gndx/ev0-astro-theme
  - https://github.com/flexdinesh/blogster/tree/main/themes/sleek
  - https://github.com/satnaing/astro-paper
  - https://github.com/chrismwilliams/astro-theme-cactus
  - https://github.com/markteekman/accessible-astro-starter
  - https://github.com/michael-andreuzza/astrosaas
- faceted search
  - facets, client side astro component
    - https://github.com/withastro/starlight/blob/main/packages/starlight/components/Search.astro
    - https://daisyui.com/docs/use/
    - https://tanstack.com/table/v8/docs/adapters/solid-table
    - https://ui.shadcn.com/docs/components/data-table
    - https://flowbite.com/blocks/application/advanced-tables/
    - https://tw-elements.com/docs/standard/data/datatables/
    - https://solid-ui-components.vercel.app/docs/components/table
- start off by implementing concrete example and generalize later
  - lists
    - latest (by publish date, or by modification date)
    - alphabetical
    - other
      - time line, graph, calendar
  - sidebar
    - custom
    - file tree
    - facets
      - tags, categories
      - publish date (but why)
      - file tree can be one of filters (hierarchical)
      - custom facets per category
  - standalone pages
    - what about sidebar?
    - Right sidebar
      - ToC
      - backlinks
      - mini graph
  - tags pages
    - do I need them? I can reuse faceted search instead
    - but what about SEO?
