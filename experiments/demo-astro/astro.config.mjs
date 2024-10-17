import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
// import { bdb } from "./src/lib/braindb.mjs";
// await bdb.ready();

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      configFile: "./tailwind.config.mjs",
      applyBaseStyles: false,
    }),
    mdx(),
  ],
  vite: {
    optimizeDeps: {
      exclude: [
        "fsevents",
        "@node-rs",
        "@napi-rs",
        // "@braindb/core",
        // "@node-rs/xxhash",
        // "@node-rs/xxhash-darwin-x64",
        // "@node-rs/xxhash-wasm32-wasi",
        // "@napi-rs/simple-git-darwin-x64",
      ],
    },
  },
});
