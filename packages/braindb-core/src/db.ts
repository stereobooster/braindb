import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "./schema";
import { resolve } from "node:path";
import { RunResult } from "better-sqlite3";

export type Db = BaseSQLiteDatabase<
  "sync",
  void | RunResult,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

let getDb: (connectionString: string) => Db;

// @ts-expect-error it exists
if (process.isBun === undefined) {
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const Database = (await import("better-sqlite3")).default;

  getDb = (connectionString: string) => {
    const sqlite = new Database(connectionString);
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: resolve(__filename, "../../drizzle") });
    return db;
  };
} else {
  const { drizzle } = await import("drizzle-orm/bun-sqlite");
  const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
  const { Database } = await import("bun:sqlite");

  getDb = (connectionString: string) => {
    const sqlite = new Database(connectionString);
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder: resolve(__filename, "../../drizzle") });
    return db;
  };
}

export { getDb };
