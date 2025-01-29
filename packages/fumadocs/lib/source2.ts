import { BrainDB, type BrainDBOptionsIn } from "@braindb/core";
import path from "node:path";
import { slug as githubSlug } from "github-slugger";

const defaultBrainDBOptions: BrainDBOptionsIn = {
  root: path.resolve(process.cwd(), "../docs/src/content/docs"),
  url: (filePath) => {
    const slug = githubSlug(path.parse(filePath).name);
    // TODO: maybe folder name?
    return slug === "index" ? `/docs/` : `/docs/${slug}/`;
  },
  git: false,
  // dbPath: path.resolve("."),
};
export const bdbInstance = new BrainDB(defaultBrainDBOptions);
bdbInstance.start(true);
await bdbInstance.ready();
