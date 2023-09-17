import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { document, link } from "./schema";
import { Graphviz } from "@hpcc-js/wasm/graphviz";
import { isNotNull, sql } from "drizzle-orm";

const graphviz = await Graphviz.load();

export function toSvg(db: BunSQLiteDatabase) {
  const edges = db
    .select({
      from_id: sql<string>`json_extract(${link.properties}, '$.from_id')`,
      to_id: sql<string>`json_extract(${link.properties}, '$.to_id')`,
    })
    .from(link)
    // need to show broken links on the graph
    .where(isNotNull(link.to))
    .all();

  const nodes = db
    .select({
      id: sql<string>`json_extract(${document.properties}, '$.id')`,
      title: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
      url: document.url,
    })
    .from(document)
    .all();

  const dot = `digraph G {
bgcolor=transparent;

${nodes
  .map((node) => `${node.id} [label="${node.title}",href="${node.url}"];`)
  .join("\n")}

${edges
  .map(
    (edge) => `${edge.from_id} -> ${edge.to_id};` /* [label="${edge.label}"]; */
  )
  .join("\n")}
}`;

  // https://graphviz.org/docs/layouts/
  return graphviz.layout(dot, "svg", "fdp");
}
