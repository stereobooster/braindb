import { resolve } from "node:path";

import { Config } from "./src/config";

const destination = resolve("../../");

export default {
  source: resolve("../.."),
  files: "/example/**/*.md",
  destination: destination,
  destinationPath: (path) => {
    if (!path.startsWith("/example")) {
      return "/tmp" + path;
    } else {
      return path.replace(/^\/example/, "/tmp");
    }
  },
  cache: false,
} satisfies Config;
