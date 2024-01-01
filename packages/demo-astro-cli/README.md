# Demo: Astro integration with CLI

## concept

- CLI watches files and writes processed files to `src/content/notes`
- Astro content collection configures to take files from `src/content/notes`

## TODO

- Layout: navbar, footer, main, sidebar
- navbar
  - [dark mode switcher](https://www.kevinzunigacuellar.com/blog/dark-mode-in-astro/)
  - [pagefind component](https://blog.otterlord.dev/posts/astro-search/)
- sidebar
  - [ToC component](https://kld.dev/building-table-of-contents/)
    - [toc-animation](https://kld.dev/toc-animation/)
  - backlinks component
- markdown
  - [Add last modified time](https://docs.astro.build/en/recipes/modified-time/)
  - [Anchor Links for Headings](https://github.com/withastro/starlight/discussions/1239)
  - [Add icons to external links](https://docs.astro.build/en/recipes/external-links/) ↗
  - page bundles (image path resolution)
- other
  - @astrojs/sitemap
  - seo
	- https://www.npmjs.com/package/@astrolib/seo
	- https://www.npmjs.com/package/astro-seo
  - image optimization
    - https://github.com/ChrisOh431/astro-remark-eleventy-image
    - astro image asset
- components
- https://github.com/natemoo-re/astro-icon
  - https://github.com/markteekman/accessible-astro-components#usage
  - https://github.com/delucis/astro-embed/tree/main/packages/astro-embed-youtube#readme
  - https://github.com/felix-berlin/astro-breadcrumbs