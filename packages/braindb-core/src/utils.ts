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


const externalLinkRegexp = RegExp(`^[a-z]+://`);

export const isExternalLink = (link: string) => externalLinkRegexp.test(link);

export const symmetricDifference = <T>(arrayA: T[], arrayB: T[]) => {
  if (arrayA.length === 0) return arrayB;
  if (arrayB.length === 0) return arrayA;

  const setA = new Set(arrayA);
  const setB = new Set(arrayB);

  const diffA = arrayA.filter((x) => !setB.has(x));
  const diffB = arrayB.filter((x) => !setA.has(x));

  return [...diffA, ...diffB];
};