import { eq, isNull, sql } from "drizzle-orm";
import { link } from "./schema";
import { Db } from "./db";

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

export function unresolvedLinks(db: Db) {
  return db
    .select({ from: link.from, propperties: link.properties })
    .from(link)
    .where(isNull(link.to))
    .all();
}

export function getLinksTo(db: Db, path: string) {
  return db
    .selectDistinct({ from: link.from })
    .from(link)
    .where(eq(link.to, path))
    .all()
    .map((x) => x.from);
}
