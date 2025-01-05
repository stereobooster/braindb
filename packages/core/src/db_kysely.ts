import { type Database as SQLite } from "better-sqlite3";
import {
    Kysely,
    ParseJSONResultsPlugin,
    SqliteDialect,
    //   Migrator,
    //   FileMigrationProvider,
} from "kysely";
import { Database } from "./schema_kysely.js";
// import { promises as fs } from "fs";
// import * as path from "path";

// import * as url from "url";
// const __filename = url.fileURLToPath(import.meta.url);
// path.resolve(__filename, "../../drizzle");

export const getKysely = (database: SQLite) => {
  const dialect = new SqliteDialect({
    database,
  });
  const db = new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
  });

//   const migrator = new Migrator({
//     db,
//     provider: new FileMigrationProvider({
//       fs,
//       path,
//       // This needs to be an absolute path.
//       migrationFolder: path.join(__dirname, "some/path/to/migrations"),
//     }),
//   });

//   const { error, results } = await migrator.migrateToLatest();

//   results?.forEach((it) => {
//     if (it.status === "Success") {
//       console.log(`migration "${it.migrationName}" was executed successfully`);
//     } else if (it.status === "Error") {
//       console.error(`failed to execute migration "${it.migrationName}"`);
//     }
//   });

//   if (error) {
//     console.error("failed to migrate");
//     console.error(error);
//     process.exit(1);
//   }

  return db;
};

export type KyselyDb = Kysely<Database>;
