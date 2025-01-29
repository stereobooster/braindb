import type { PageTree } from "fumadocs-core/server";
import { bdbInstance } from "./source2";

// import { useEffect, useState } from "react";
// export const usePageTree = () => {
//   const [data, setData] = useState<PageTree.Root>({
//     name: <>{}</>,
//     children: [],
//   });
//   useEffect(() => {
//     bdbInstance
//       .kysely()
//       .selectFrom("files")
//       .select(["path", "url", "data"])
//       .where("type", "=", "markdown")
//       .execute()
//       .then((pages) => {
//         setData(convertPageTree(pages as RawTree));
//       });
//   }, []);
//   return data;
// };

export function getPageTree() {
  return bdbInstance
    .kysely()
    .selectFrom("files")
    .select(["path", "url", "data"])
    .where("type", "=", "markdown")
    .execute()
    .then((pages) => convertPageTree(pages as RawTree));
}

type RawTree = Array<{
  path: string;
  url: string;
  data: {
    title: string;
  };
}>;

type ObjTree = { [P in string]: ObjTree } & {
  "/url"?: string;
  "/file"?: string;
};

function recursiveObj(raw: RawTree): ObjTree {
  const tmp: ObjTree = Object.create(null);
  raw.forEach((x) => {
    let k: ObjTree = Object.create(null);
    const pathParts = x.path.split("/").slice(1);
    const file = pathParts.pop();
    if (pathParts.length === 0) {
      // file === "index.md" || file === "index.mdx" ? "" :
      tmp[x.data.title] = {
        "/url": x.url,
        "/file": file,
      } as ObjTree;
    }
    pathParts.forEach((y, i) => {
      if (i === 0) {
        tmp[y] = tmp[y] || Object.create(null);
        k = tmp[y];
      } else {
        k[y] = k[y] || Object.create(null);
        k = k[y];
      }
      if (pathParts.length === i + 1)
        k[x.data.title] = {
          "/url": x.url,
          "/file": file,
        } as ObjTree;
    });
  });
  return tmp;
}

function recursiveNode(obj: ObjTree): PageTree.Root["children"] {
  return Object.entries(obj)
    .map(([k, v]) => {
      if (typeof v === "string") return;
      const ks = Object.keys(v);
      const page =
        ks.length === 2 && ks.includes("/url") && ks.includes("/file");
      if (page) {
        return {
          type: "page",
          name: <>{k}</>,
          url: v["/url"],
          $ref: {
            file: v["/file"],
          },
          // external?: boolean;
          // icon?: ReactElement;
        };
      } else {
        return {
          type: "folder",
          name: <>{k}</>,
          children: recursiveNode(v),
          // $ref?: {
          //   metaFile?: string;
          // };
          // description?: ReactNode;
          // root?: boolean;
          // defaultOpen?: boolean;
          // index?: Item;
          // icon?: ReactElement;
        };
      }
    })
    .filter(Boolean) as PageTree.Root["children"];
}

function convertPageTree(raw: RawTree): PageTree.Root {
  const obj = recursiveObj(raw);
  return {
    name: <>{Object.keys(obj)[0]}</>,
    children: recursiveNode(obj),
  } satisfies PageTree.Root;
}

export async function getPage(slug: string[] | undefined) {
  const url = `/${["docs", ...(slug || [])].join("/")}/`;
  return (
    await bdbInstance
      .kysely()
      .selectFrom("files")
      .selectAll()
      .where("url", "=", url)
      .execute()
  )[0];
}

export async function generateParams() {
  const pages = await bdbInstance
    .kysely()
    .selectFrom("files")
    .select(["url"])
    .where("type", "=", "markdown")
    .execute();

  return pages.map((page) => ({
    slug: page.url.split("/").slice(2, -1),
  }));
}
