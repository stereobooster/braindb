import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

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
        "@node-rs/xxhash-wasm32-wasi",
        "@napi-rs/simple-git-darwin-x64",
      ],
    },
  },
});
