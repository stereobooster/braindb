import { slug as githubSlug } from "github-slugger";
import path from "node:path";
import process from "node:process";
import { BrainDB, type BrainDBOptionsIn } from "@braindb/core";

const generateUrl: BrainDBOptionsIn["url"] = (filePath, _frontmatter) => {
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

  return `${slug}/`;
};

export const bdb = new BrainDB({
  // dbPath: process.cwd() + "/.braindb",
  root: path.resolve(process.cwd(), "src/content"),
  // source: "/notes",
  url: generateUrl,
  // cache: false,
});

bdb.start();
// bdb.on("*", (action) => console.log(action));
