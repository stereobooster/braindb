import { drizzle, BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { Database } from "bun:sqlite";

const connectionString = "tmp/db.sqlite3";
const sqlite = new Database(connectionString);
const db: BunSQLiteDatabase = drizzle(sqlite);

migrate(db, { migrationsFolder: "drizzle" });

export { db };
