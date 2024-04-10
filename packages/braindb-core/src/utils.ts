import { xxh64, xxh32 } from "@node-rs/xxhash";
import serialize from "serialize-javascript";

const memoizeSecret: any = {};
export const memoizeOnce = <A, B>(f: (x: A) => B) => {
  let arg: A = memoizeSecret;
  let result: B;
  return (x: A) => {
    if (x !== arg) {
      arg = x;
      result = f(x);
    }
    return result;
  };
};

// alternative https://github.com/zbauman3/Deterministic-Object-Hash
export const cheksumConfig = memoizeOnce((conf: any) => xxh32(serialize(conf)));

// can use streaming instead of reading whole file
export const cheksum64str = (str: string) => xxh64(str).toString(36);

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
