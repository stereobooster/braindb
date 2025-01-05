import { type Database as SQLite } from "better-sqlite3";
import { KyselyDb } from "./schema_kysely.js";

export type AllDb = {
  // drizzle: DrizzleDb;
  kysely: KyselyDb;
  // passing SQLite around for sync execution
  sqlite: SQLite;
};
