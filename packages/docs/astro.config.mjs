import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import robotsTxt from "astro-robots-txt";

import { rehypeMermaid } from "@beoe/rehype-mermaid";
import { getCache } from "@beoe/cache";
import { remarkWikiLink } from "./src/lib/remarkWikiLink.mjs";
import { bdb } from "./src/lib/braindb.mjs";
await bdb.ready();

const cache = await getCache();

// https://astro.build/config
export default defineConfig({
  site: "https://braindb.stereobooster.com/",
  integrations: [
    starlight({
      pagination: false,
      lastUpdated: true,
      logo: {
        light: "./src/assets/logo.svg",
        dark: "./src/assets/logo-dark.svg",
      },
      customCss: ["./src/styles/custom.css"],
      title: "BrainDB",
      social: {
        github: "https://github.com/stereobooster/braindb",
      },
      editLink: {
        baseUrl:
          "https://github.com/stereobooster/braindb/edit/main/packages/docs/",
      },
      sidebar: [
        { label: "Introduction", link: "/" },
        {
          label: "Unsorted notes",
          autogenerate: {
            directory: "notes",
          },
        },
      ],
    }),
    robotsTxt(),
  ],
  markdown: {
    remarkPlugins: [[remarkWikiLink, { bdb }]],
    rehypePlugins: [
      [
        rehypeMermaid,
        { class: "not-content", strategy: "img-class-dark-mode", cache },
      ],
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ["fsevents", "@node-rs", "@napi-rs"],
    },
  },
});
