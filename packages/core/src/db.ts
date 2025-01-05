import { type Database as SQLite } from "better-sqlite3";
import { KyselyDb } from "./db_kysely.js";

export type AllDb = {
  kysely: KyselyDb;
  // passing SQLite around for sync execution
  sqlite: SQLite;
};
