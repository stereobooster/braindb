import { slug as githubSlug } from "github-slugger";
import path from "node:path";
import process from "node:process";
import { BrainDB } from "@braindb/core";

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

const start = new Date().getTime();

export const bdb = new BrainDB({
  root: path.resolve(process.cwd(), "src/content"),
  url: (filePath, _frontmatter) => `${generateSlug(filePath)}/`,
  // source: "/notes",
  dbPath: process.cwd(),
  // cache: true,
  // git: path.resolve(process.cwd(), "../.."),
  storeMarkdown: false,
});

bdb.start();
bdb.on("*", (action, opts) => {
  if (action === "ready") {
    console.log(`Done: ${new Date().getTime() - start}`);
  }
  if (opts) {
    opts.document
      .unresolvedLinks()
      .forEach((link) =>
        console.log(
          `Unresolved link: ${link
            .from()
            .path()}:${link.line()}:${link.column()}`
        )
      );
  }
});
