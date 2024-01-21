import { resolve } from "node:path";
import { slug as githubSlug } from "github-slugger";
import path from "node:path";

import { type Config } from "@braindb/cli";

const generateUrl: Config["url"] = (filePath, _frontmatter) => {
  const withoutFileExt = filePath.replace(
    new RegExp(path.extname(filePath) + "$"),
    ""
  );
  const rawSlugSegments = withoutFileExt.split(path.sep);

  if (rawSlugSegments[0] === "example") rawSlugSegments[0] = "notes";
  if (rawSlugSegments[0] === "" && rawSlugSegments[1] === "example")
    rawSlugSegments[1] = "notes";

  const slug = rawSlugSegments
    // Slugify each route segment to handle capitalization and spaces.
    // Note: using `slug` instead of `new Slugger()` means no slug deduping.
    .map((segment) => githubSlug(segment))
    .join("/")
    .replace(/\/index$/, "");

  return `${slug}/`;
};

export default {
  root: resolve("../.."),
  source: "/example",
  destination: resolve("src/content"),
  transformPath: (filePath: string) => filePath.replace(/^\/example/, "/notes"),
  url: generateUrl,
  linkType: "web",
  cache: false,
  // transformFrontmatter: (doc) => {
  //   const frontmatter = doc.frontmatter();
  //   frontmatter["url"] = doc.url();
  //   frontmatter["backlinks"] = doc.backDocuments().map((bl) => ({
  //     url: bl.url(),
  //     title: bl.title(),
  //   }));
  //   return frontmatter;
  // },
} satisfies Config;
