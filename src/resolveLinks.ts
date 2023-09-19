import { sql } from "drizzle-orm";
import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";

export function resolveLinks<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>
) {
  // TODO: mayby use separate columns with indexes instead of JSON?
  // TODO: check for abiguous links
  // Maybe update would be better than replace?
  db.run(
    sql`
  REPLACE INTO links
  SELECT "from", "path" as "to", "start", 
      json_set(links.properties, '$.to_id', json_extract(documents.properties, '$.id')) as properties,
      links.ast as "ast"
  FROM links INNER JOIN documents ON
      json_extract(links.properties, '$.to_slug') = documents.slug OR
      json_extract(links.properties, '$.to_url') = documents.url OR
      json_extract(links.properties, '$.to_url') = documents.path
  WHERE links."to" IS NULL;`
  );
}

// console.log(
//   db.select({ path: document.path, url: document.url }).from(document).all()
// );

// const unresolvedLinks = db
//   .select({ from: link.from, propperties: link.properties, ast: link.ast })
//   .from(link)
//   .where(isNull(link.to))
//   .all();
// console.log(unresolvedLinks);
