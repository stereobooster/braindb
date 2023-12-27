import { resolve } from "node:path";
import process from "node:process";
import { BrainDB } from "@braindb/core";

export const bdb = new BrainDB({
  dbPath: process.cwd() + "/.braindb",
  root: resolve(process.cwd(), "../.."),
  source: "/example",
  url: (filePath, _frontmatter) => {
    let url =
      filePath
        .replace(/^\/example/, "/notes")
        .replace(/_?index\.md$/, "")
        .replace(/\.md$/, "") || "/";

    if (!url.endsWith("/")) url = url + "/";

    return url;
  },
  cache: false,
});

bdb.start();
// bdb.on("*", (action) => console.log(action));
