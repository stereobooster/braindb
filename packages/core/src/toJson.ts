import { eq, isNotNull, sql } from "drizzle-orm";
import { document, link } from "./schema.js";
import { Db } from "./db.js";
import { alias } from "drizzle-orm/sqlite-core";

const documentFrom = alias(document, "documentFrom");
const documentTo = alias(document, "documentTo");

// https://graphology.github.io/serialization.html#format
export function toGraphology(db: Db) {
  const edges = db
    .select({
      source: documentFrom.id,
      target: documentTo.id,
      // key: link.id,
      // attributes: { label: link.label },
    })
    .from(link)
    .innerJoin(documentFrom, eq(link.from, documentFrom.path))
    .innerJoin(documentTo, eq(link.to, documentTo.path))
    // need to show broken links on the graph
    .where(isNotNull(link.to))
    .all();

  const nodes = db
    .select({
      key: document.id,
      attributes: {
        label: sql<string>`json_extract(${document.frontmatter}, '$.title')`,
        url: document.url,
      },
    })
    .from(document)
    .all();

  return {
    attributes: { name: "g" },
    options: {
      allowSelfLoops: true,
      multi: true,
      type: "directed",
    },
    nodes,
    edges,
  };
}
