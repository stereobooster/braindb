import { resolve } from "node:path";

import { Config } from "./src/config";

export default {
  source: resolve("../../../content/files/en-us/"),
  destination: resolve("../../"),
  generateUrl: (_path, frontmatter) => `/en-US/docs/${frontmatter.slug}/`,
  destinationPath: (path) => "/tmp" + path,
  cache: true,
} satisfies Config;

// export default {
//   source: resolve("../.."),
//   files: "/example/**/*.md",
//   destination: resolve("../../tmp/"),
//   destinationPath: (path) => path.replace(/^\/example/, "/tmp"),
//   cache: false,
// } satisfies Config;
