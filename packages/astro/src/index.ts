import { defineIntegration } from "astro-integration-kit";
import { slug as githubSlug } from "github-slugger";
import path from "node:path";
import process from "node:process";
import { BrainDB, type BrainDBOptionsIn } from "@braindb/core";
import { remarkWikiLink } from "./remarkWikiLink.js";
import { z } from "astro/zod";
import wikiLinkPlugin from "@braindb/remark-wiki-link";

const brainDBOptionsIn = z
  .object({
    dbPath: z.string(),
    cache: z.boolean(),
    url: z.function(
      z.tuple([z.string(), z.record(z.string(), z.any())]),
      z.string()
    ),
    slug: z.function(
      z.tuple([z.string(), z.record(z.string(), z.any())]),
      z.string()
    ),
    root: z.string(),
    source: z.string(),
    git: z.boolean(),
    storeMarkdown: z.boolean(),
    // need to pass false in order to disable built-in remarkWikiLink plugin
    remarkWikiLink: z.boolean(),
  })
  .partial();

// slug implementation according to Astro
// see astro/packages/astro/src/content/utils.ts
export const generateSlug = (filePath: string) => {
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

const slugToUrl = (slug: string) => {
  if (!slug.startsWith("/")) slug = `/${slug}`;
  if (!slug.endsWith("/")) slug = `${slug}/`;
  return slug;
};

const defaultBrainDBOptions: BrainDBOptionsIn = {
  root: path.resolve(process.cwd(), "src/content/docs"),
  url: (filePath, frontmatter) =>
    frontmatter.url
      ? String(frontmatter.url)
      : slugToUrl(
          frontmatter.slug ? String(frontmatter.slug) : generateSlug(filePath)
        ),
  git: true,
};

let bdbInstance = new BrainDB(defaultBrainDBOptions);

export function getBrainDb() {
  try {
    bdbInstance.start(true);
  } catch {}
  return bdbInstance;
}

export const brainDbAstro = defineIntegration({
  name: "@braindb/astro",
  optionsSchema: brainDBOptionsIn.optional(),
  setup({ options }) {
    if (options) {
      bdbInstance.stop();
      // @ts-expect-error tsup is getting on my nerves
      bdbInstance = new BrainDB({ ...defaultBrainDBOptions, ...options });
    }

    return {
      hooks: {
        "astro:config:setup": async ({ config, updateConfig }) => {
          await getBrainDb().ready();

          const newConfig = {
            markdown: {
              remarkPlugins:
                options?.remarkWikiLink === false
                  ? config.markdown.remarkPlugins
                  : [
                      ...(config.markdown.remarkPlugins || []),
                      // I had to use wikiLinkPlugin without resolver
                      // and puted resolver in separate plugin using visit
                      // to support wikilinks in remark-dataview output
                      wikiLinkPlugin,
                      [remarkWikiLink, { bdb: getBrainDb() }],
                    ],
            },
            vite: {
              // https://github.com/vitejs/vite/issues/14289
              optimizeDeps: {
                exclude: [
                  ...(config.vite.optimizeDeps?.exclude || []),
                  "@braindb",
                  // "fsevents",
                  // "@node-rs",
                  // "@napi-rs",
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

export default brainDbAstro;
