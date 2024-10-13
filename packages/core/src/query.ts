import { Db } from "./db.js";
import { Document } from "./Document.js";
import { document } from "./schema.js";
import { asc, desc, eq, and, sql, SQLWrapper, SQL } from "drizzle-orm";
import { JsonLimitedObject, JsonPrimitive } from "./types.js";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

export type SortDirection = "asc" | "desc";

// this would be similar to
// https://github.com/stereobooster/facets/blob/main/packages/facets/src/Facets.ts#L138-L150
export type DocumentsOtions = {
  slug?: string;
  url?: string;
  /**
   * Limited search by frontmatter fields - only strict comparison for primitive values,
   * like: string, number, boolean
   * ATTENTION: arrays in frontammter don't work e.g. `tags: [X,Y]`
   */
  frontmatter?: JsonLimitedObject;
  sort?: ["updated_at", SortDirection];
};

export function documentsSync(db: Db, options?: DocumentsOtions) {
  let query = db.select({ path: document.path }).from(document);

  const where: (SQLWrapper | undefined)[] = [];
  if (options?.slug !== undefined) {
    where.push(eq(document.slug, options?.slug));
  }
  if (options?.url !== undefined) {
    where.push(eq(document.url, options?.url));
  }
  if (options?.frontmatter !== undefined) {
    Object.entries(flattenObj(options?.frontmatter)).forEach(([key, value]) =>
      where.push(eq(sql`${document.frontmatter}->>${"$." + key}`, value))
    );
  }

  const order: (SQLiteColumn | SQL)[] = [];
  if (options?.sort !== undefined) {
    const dir = options?.sort?.[1] === "asc" ? asc : desc;
    order.push(dir(document.updated_at));
  }

  return query
    .where(and(...where))
    .orderBy(...order)
    .all()
    .map(({ path }) => new Document(db, path));
}

function flattenObj(
  obj: JsonLimitedObject,
  parent?: string,
  res = Object.create(null) as Record<string, JsonPrimitive>
) {
  for (let key in obj) {
    const propName = parent ? parent + "." + key : key;
    const value = obj[key];
    if (typeof value == "object" && value !== null) {
      flattenObj(value, propName, res);
    } else {
      res[propName] = value;
    }
  }
  return res;
}
