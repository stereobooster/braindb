import { and, eq, isNull, ne, sql, isNotNull } from "drizzle-orm";
import { link } from "./schema.js";
import { Db } from "./db.js";

export function resolveLinks(db: Db) {
  // TODO: maybe use separate columns with indexes instead of JSON?
  // TODO: check for ambiguous links
  // Maybe update would be better than replace?
  db.run(
    sql`
  REPLACE INTO links
  SELECT "from", "path" as "to", "start", 
    links.properties as "properties",
    links.from_id as "from_id",
    json_extract(documents.properties, '$.id') as to_id,
    links.to_slug as to_slug,
    links.to_url as to_url,
    links.to_path as to_path,
    links.to_anchor as to_anchor,
    links.label as label
  FROM links INNER JOIN documents ON
      links.to_slug = documents.slug OR
      links.to_url = documents.url OR
      links.to_path = documents.path
  WHERE links."to" IS NULL;`
  );
}

export function unresolvedLinks(db: Db, idPath?: string) {
  return db
    .select({ from: link.from, start: link.start })
    .from(link)
    .where(
      idPath === undefined
        ? isNull(link.to)
        : and(isNull(link.to), eq(link.from, idPath))
    )
    .all();
}

type GetDocumentsProps = {
  db: Db;
  idPath: string;
  selfLinks?: boolean;
};

/**
 * Incoming links
 */
export function getDocumentsFrom({
  db,
  idPath,
  selfLinks = false,
}: GetDocumentsProps) {
  return db
    .selectDistinct({ from: link.from })
    .from(link)
    .where(
      selfLinks
        ? eq(link.to, idPath)
        : and(eq(link.to, idPath), ne(link.from, idPath))
    )
    .all()
    .map((x) => x.from);
}

/**
 * Outgoing links
 */
export function getDocumentsTo({
  db,
  idPath,
  selfLinks = false,
}: GetDocumentsProps) {
  return db
    .selectDistinct({ to: link.to })
    .from(link)
    .where(
      and(
        isNotNull(link.to),
        selfLinks
          ? eq(link.from, idPath)
          : and(eq(link.from, idPath), ne(link.to, idPath))
      )
    )
    .all()
    .map((x) => x.to as string);
}

/**
 * Incoming and Outgoing links
 */
export function getConnectedDocuments(props: GetDocumentsProps) {
  return [...new Set([...getDocumentsFrom(props), ...getDocumentsTo(props)])];
}
