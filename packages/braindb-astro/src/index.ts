import { defineIntegration } from "astro-integration-kit";
import { slug as githubSlug } from "github-slugger";
import path from "node:path";
import process from "node:process";
import { BrainDB } from "@braindb/core";
import { remarkWikiLink } from "./remarkWikiLink.js";

// slug implementation according to Astro
// see astro/packages/astro/src/content/utils.ts
const generateSlug = (filePath: string) => {
  const withoutFileExt = filePath.replace(
    new RegExp(path.extname(filePath) + "$"),
    ""
  );
  const rawSlugSegments = withoutFileExt.split(path.sep);
  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, "");

  return slug;
};

let bdbInstance = new BrainDB({
  root: path.resolve(process.cwd(), "src/content/docs"),
  url: (filePath, _frontmatter) => `${generateSlug(filePath)}/`,
  git: true,
  // dbPath: process.cwd(),
});

export function bdb() {
  try {
    bdbInstance.start();
  } catch {}
  return bdbInstance;
}

export default defineIntegration({
  name: "@braindb/astro",
  setup() {
    // we can pass options for bdb here
    // bdbInstance = new BrainDB(new_options)
    // bdb.start();

    return {
      hooks: {
        "astro:config:setup": async ({ config, updateConfig }) => {
          await bdb().ready();

          const newConfig = {
            markdown: {
              remarkPlugins: [
                ...(config.markdown.remarkPlugins || []),
                [remarkWikiLink, { bdb: bdb() }],
              ],
            },
            vite: {
              optimizeDeps: {
                exclude: [
                  ...(config.vite.optimizeDeps?.exclude || []),
                  "fsevents",
                  "@node-rs",
                  "@napi-rs",
                ],
              },
            },
          };
          updateConfig(newConfig);
        },
      },
    };
  },
});
