import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "./schema_drizzle.js";
import { resolve } from "node:path";
import { type Database as SQLite, RunResult } from "better-sqlite3";

import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);

export const getDrizzle = (sqlite: SQLite) => {
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: resolve(__filename, "../../drizzle") });
  return db;
};

export type Db = BaseSQLiteDatabase<
  "sync",
  void | RunResult,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

// let getDb: (connectionString: string) => Db;

// if (process.isBun === undefined) {
//   const { drizzle } = await import("drizzle-orm/better-sqlite3");
//   const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
//   // @ts-ignore
//   const Database = (await import("better-sqlite3")).default;

//   getDb = (connectionString: string) => {
//     const sqlite = new Database(connectionString);
//     const db = drizzle(sqlite, { schema });
//     migrate(db, { migrationsFolder: resolve(__filename, "../../drizzle") });
//     return db;
//   };
// } else {
//   const { drizzle } = await import("drizzle-orm/bun-sqlite");
//   const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
//   const { Database } = await import("bun:sqlite");

//   getDb = (connectionString: string) => {
//     const sqlite = new Database(connectionString);
//     const db = drizzle(sqlite, { schema });
//     migrate(db, { migrationsFolder: resolve(__filename, "../../drizzle") });
//     return db;
//   };
// }

// export { getDb };
