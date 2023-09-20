import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { getFiles } from "./utils";
import { addFile } from "./addFile";

export function scanFolder<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  pathToCrawl: string,
  cacheEnabled = true
) {
  return Promise.all(
    getFiles(pathToCrawl).map((file) => addFile(db, file, cacheEnabled))
  );
}
