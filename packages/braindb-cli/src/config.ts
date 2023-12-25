import { cosmiconfig } from "cosmiconfig";
import { cwd } from "node:process";
import { BrainDBOptionsIn, BrainDBOptionsOut } from "@braindb/core";

// For inspiration https://github.com/vitejs/vite/blob/main/packages/vite/src/node/config.ts#L126
// TODO: root should be optional
export type Config = BrainDBOptionsIn &
  BrainDBOptionsOut & {
    destination?: string;
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
const generateUrl: (root: string | undefined) => BrainDBOptionsIn["url"] =
  (source) => (path, _frontmatter) => {
    const dir = source ? source : "";
    let url =
      path
        .replace(dir, "")
        .replace(/_?index\.md$/, "")
        .replace(/\.md$/, "") || "/";

    if (!url.startsWith("/")) url = "/" + url;

    return url;
  };

export async function getConfig() {
  const defaultCfg: Config = {
    root: cwd(),
    cache: true,
  };

  let cfg: Partial<Config> = {};
  try {
    const res = await explorer.search();
    cfg = res?.config;
  } catch (e) {}

  const res = { ...defaultCfg, ...cfg };
  if (!res.url) res.url = generateUrl(res.source);
  return res;
}
