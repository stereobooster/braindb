import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { getFiles } from "./utils";
import { addFile } from "./addFile";
import type { queue } from "fastq";

export function scanFolder<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  q: queue,
  pathToCrawl: string,
  cacheEnabled = true
) {
  return Promise.all(
    getFiles(pathToCrawl).map((file) => addFile(db, q, file, cacheEnabled))
  );
}
