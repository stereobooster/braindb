import { fdir } from "fdir";
import { createHash, randomBytes } from "node:crypto";

// can use streaming instead of reading whole file
// https://github.com/Cyan4973/xxHash
export const getCheksum = (str: string) =>
  createHash("md5").update(str, "utf8").digest("base64url");

// https://github.com/juanelas/bigint-crypto-utils/blob/main/src/ts/randBetween.ts
// it should be of length 26
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
export const getUid = () =>
  "n" + randomBytes(128).readBigInt64BE().toString(36).replace("-", "");

export const getFiles = (pathToCrawl: string) => {
  // TODO: is there way to skip scanning folders if mtime didn't change?
  const crawler = new fdir()
    .withBasePath()
    .filter((path, _isDirectory) => path.endsWith(".md"));

  return crawler.crawl(pathToCrawl).sync();
};

const externalLinkRegexp = RegExp(`^[a-z]+://`);

export const isExternalLink = (link: string) => externalLinkRegexp.test(link);
