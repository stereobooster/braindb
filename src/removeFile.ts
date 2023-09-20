import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { document, link } from "./schema";
import { eq } from "drizzle-orm";

export async function removeFile<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  file: string
) {
  const path = "/" + file;
  db.delete(document).where(eq(document.path, path)).run();
  db.delete(link).where(eq(link.from, path)).run();
  db.update(link).set({ to: null }).where(eq(link.to, path)).run();
  // TODO: and mark documents with previously matched links as changed, so that they would be re-rendered
}
