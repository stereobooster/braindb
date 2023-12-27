# Demo: Astro integration with core

## TODO

- main problem is: braindb watches files, but how to trigger update in Astro?
  - maybe there is a clue in [other implementations](https://docs.astro.build/en/guides/cms/)?
    - https://github.com/storyblok/storyblok-astro/
    - https://github.com/sanity-io/sanity-astro/tree/main/packages/sanity-astro
    - https://vitejs.dev/guide/api-plugin
    - https://github.com/withastro/astro/blob/0ee255ae36969361d87fcd424d83fd9aa7b34b7a/packages/astro/src/content/vite-plugin-content-imports.ts#L134C5-L134C15
    - https://github.com/withastro/astro/blob/481c13a08c2d6a5bc1b4a8fe4259714d868eb514/packages/astro/src/content/server-listeners.ts#L49-L76