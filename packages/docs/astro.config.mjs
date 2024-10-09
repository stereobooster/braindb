import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import robotsTxt from "astro-robots-txt";

import { rehypeMermaid } from "@beoe/rehype-mermaid";
import { getCache } from "@beoe/cache";
// import process from "node:process";

// import { createResolver } from "astro-integration-kit";
// import { hmrIntegration } from "astro-integration-kit/dev";
const { default: braindbAstro } = await import("@braindb/astro");

const cache = await getCache();

// https://astro.build/config
export default defineConfig({
  site: "https://braindb.stereobooster.com/",
  integrations: [
    braindbAstro({
      // dbPath: process.cwd(),
      // git: false,
    }),
    // hmrIntegration({
    // 	directory: createResolver(import.meta.url).resolve("../package/dist"),
    // }),
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
      components: {
        TableOfContents: "./src/components/TableOfContents.astro",
      },
    }),
    robotsTxt(),
  ],
  markdown: {
    rehypePlugins: [
      [
        rehypeMermaid,
        { class: "not-content", strategy: "img-class-dark-mode", cache },
      ],
    ],
  },
});
