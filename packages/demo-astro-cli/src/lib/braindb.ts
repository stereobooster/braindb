import { slug as githubSlug } from "github-slugger";
import path from "node:path";
import process from "node:process";
import { BrainDB, type BrainDBOptionsIn } from "@braindb/core";

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

export const bdb = new BrainDB({
  root: path.resolve(process.cwd(), "src/content"),
  url: (filePath, _frontmatter) => `${generateSlug(filePath)}/`,
  // source: "/notes",
  // dbPath: process.cwd() + "/.braindb",
  // cache: false,
});

bdb.start();
bdb.on("*", (action, opts) => {
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
  if (action === "ready") {
    // console.log(bdb.toJson());
  }
});
