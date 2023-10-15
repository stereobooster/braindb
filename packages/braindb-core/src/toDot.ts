import { isNotNull, sql } from "drizzle-orm";
import { document, link } from "./schema";
import { Db } from "./db";

export function toDot(db: Db) {
  const edges = db
    .select({
      from_id: link.from_id,
      to_id: link.to_id,
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

  return dot;
}
