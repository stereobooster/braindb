import { isNotNull, sql } from "drizzle-orm";
import { document, link } from "./schema";
import { Db } from "./db";

const defaults = {
  style: [
    {
      selector: "node",
      style: {
        label: "data(label)",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "control-point-step-size": 40,
      },
    },
  ],
  layout: {
    name: "grid",
  },
  width: 1000,
  height: 1000,
  background: "white",
};

export function toCyjs(db: Db) {
  const edges = db
    .select({
      from_id: link.from_id,
      to_id: link.to_id,
    })
    .from(link)
    // need to show broken links on the graph
    .where(isNotNull(link.to))
    .all()
    .map((edge) => ({
      data: {
        source: edge.from_id,
        target: edge.to_id,
      },
    }));

  const nodes = db
    .select({
      id: sql<string>`json_extract(${document.properties}, '$.id')`,
      title: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
    })
    .from(document)
    .all()
    .map((node) => ({
      data: {
        id: node.id,
        label: node.title,
      },
    }));

  return { elements: { nodes, edges }, ...defaults };
}

// https://jsongraphformat.info/
// export function toJsonGraph(db: Db) {
//   const edges = db
//     .select({
//       from_id: link.from_id,
//       to_id: link.to_id,
//     })
//     .from(link)
//     // need to show broken links on the graph
//     .where(isNotNull(link.to))
//     .all()
//     .map((edge) => ({
//       source: edge.from_id,
//       target: edge.to_id,
//       // relation: "linksTo"
//     }));

//   const nodes = db
//     .select({
//       id: sql<string>`json_extract(${document.properties}, '$.id')`,
//       title: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
//     })
//     .from(document)
//     .all()
//     .reduce((acc, node) => {
//       acc[node.id] = {
//         id: node.id,
//         label: node.title,
//       };
//       return acc;
//     }, {} as Record<string, Record<string, string>>);

//   return {
//     graph: {
//       id: "g",
//       type: "g",
//       label: "g",
//       metadata: {},
//       nodes,
//       edges,
//     },
//   };
// }
