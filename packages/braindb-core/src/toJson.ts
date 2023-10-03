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

export function toJson(db: Db) {
  const edges = db
    .select({
      from_id: sql<string>`json_extract(${link.properties}, '$.from_id')`,
      to_id: sql<string>`json_extract(${link.properties}, '$.to_id')`,
      start: link.start,
    })
    .from(link)
    // need to show broken links on the graph
    .where(isNotNull(link.to))
    .all()
    .map((edge) => ({
      data: {
        // id: `${edge.from_id}_${edge.to_id}_${edge.start}`,
        source: edge.from_id,
        target: edge.to_id,
      },
    }));

  const nodes = db
    .select({
      id: sql<string>`json_extract(${document.properties}, '$.id')`,
      title: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
      url: document.url,
    })
    .from(document)
    .all()
    .map((node) => ({
      data: {
        id: node.id,
        label: node.title,
      },
    }));

  return { elements: [...nodes, ...edges], ...defaults };
}
