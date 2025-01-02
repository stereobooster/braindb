import { Frontmatter } from "./index.js";
import { basename } from "node:path";

export const defaultGetUrl = (filePath: string, _frontmatter: Frontmatter) => {
  let url =
    filePath.replace(/\/_?index\.mdx?$/, "").replace(/\.mdx?$/, "") || "/";

  // if (!url.startsWith("/")) url = "/" + url;
  if (!url.endsWith("/")) url = url + "/";

  return url;
};

// Hugo style
// export const getSlug = (filePath: string, frontmatter: Frontmatter) => {
//   let slug: string;
//   if (frontmatter.slug) {
//     // no validation - trusting source
//     slug = String(frontmatter.slug);
//   } else {
//     slug = basename(filePath.replace(/\/_?index\.mdx?$/, "")).replace(/\.mdx?$/, "") || "/"
//   }
// };

export const defaultGetSlug = (filePath: string, _frontmatter: Frontmatter) =>
  basename(filePath).replace(/\.mdx?$/, "");
