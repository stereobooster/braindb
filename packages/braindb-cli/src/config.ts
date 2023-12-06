import { cosmiconfig } from "cosmiconfig";
import { cwd } from "node:process";
import { dirname } from "node:path";
import { BrainDBOptions } from "@braindb/core";

// For inspiration https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L126
export type Config = BrainDBOptions & {
  destination?: string;
  destinationPath?: (path: string) => string;
};

const moduleName = "braindb";
const explorer = cosmiconfig(moduleName, {
  searchPlaces: [
    // "package.json",
    `${moduleName}.config.js`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.mjs`,
    `${moduleName}.config.cjs`,
  ],
});

// shall it use URIEncode or URIDecode?
// just an example, depends on configuation of static site generator
// For example, https://gohugo.io/content-management/urls/#tokens
const generateUrl: (source: string) => BrainDBOptions["generateUrl"] =
  (source) => (path, frontmatter) => {
    let url = "";
    path =
      path
        .replace(dirname(source), "")
        .replace(/^\/\//, "/")
        .replace(/_?index\.md$/, "")
        .replace(/\.md$/, "") || "/";

    if (frontmatter.slug) {
      url = `${dirname(path)}/${frontmatter.slug}/`;
    } else if (frontmatter.url) {
      url = String(frontmatter.url);
    } else {
      url = path;
    }

    if (!url.startsWith("/")) url = "/" + url;
    if (!url.endsWith("/")) url = url + "/";

    return url;
  };

export async function getConfig() {
  const defaultCfg: Config = {
    source: cwd(),
    cache: true,
  };

  let cfg: Partial<Config> = {};
  try {
    const res = await explorer.search();
    cfg = res?.config;
  } catch (e) {}

  const res = { ...defaultCfg, ...cfg };
  if (!res.generateUrl) res.generateUrl = generateUrl(res.source);
  return res;
}
