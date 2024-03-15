import { xxh64 } from "@node-rs/xxhash";

// can use streaming instead of reading whole file
export const getCheksum = (str: string) => xxh64(str).toString(36);

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
