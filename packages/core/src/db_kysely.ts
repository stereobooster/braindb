import { type Database as SQLite } from "better-sqlite3";
import {
  Kysely,
  ParseJSONResultsPlugin,
  SqliteDialect,
  Migrator,
  FileMigrationProvider,
} from "kysely";
import { Database } from "./schema_kysely.js";
import { promises as fs } from "fs";
import * as path from "path";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);

export const getKysely = (database: SQLite) => {
  const dialect = new SqliteDialect({
    database,
  });
  return new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
  });
};

export const migrateKysely = (db: Kysely<any>) => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.resolve(__filename, "../migrations"),
    }),
  });

  //   results?.forEach((it) => {
  //     if (it.status === "Success") {
  //       console.log(`migration "${it.migrationName}" was executed successfully`);
  //     } else if (it.status === "Error") {
  //       console.error(`failed to execute migration "${it.migrationName}"`);
  //     }
  //   });

  return migrator.migrateToLatest();
};

export type KyselyDb = Kysely<Database>;
