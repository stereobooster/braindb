import { resolve } from "node:path";

import { type Config } from "@braindb/cli";

const generateUrl: Config["url"] = (filePath, _frontmatter) => {
  let url =
    filePath
      .replace(/^\/example/, "/notes")
      .replace(/_?index\.md$/, "")
      .replace(/\.md$/, "") || "/";

  if (!url.endsWith("/")) url = url + "/";

  return url;
};

export default {
  root: resolve("../.."),
  source: "/example",
  destination: resolve("../astro-demo/src/content"),
  transformPath: (filePath: string) => filePath.replace(/^\/example/, "/notes"),
  url: generateUrl,
  linkType: "web",
  cache: false,
  transformFrontmatter: (doc) => {
    const frontmatter = doc.frontmatter();
    frontmatter["url"] = doc.url();
    frontmatter["backlinks"] = doc.backDocuments().map((bl) => ({
      url: bl.url(),
      title: bl.title(),
    }));
    return frontmatter;
  },
} satisfies Config;
