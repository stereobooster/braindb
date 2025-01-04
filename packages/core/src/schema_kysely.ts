import { type Database as SQLite } from "better-sqlite3";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import { Generated, JSONColumnType } from "kysely";
import type { Node } from "unist";
import { JsonObject } from "./types.js";

interface FileTable {
  // -- private fileds --
  // can use Inode number here
  id: Generated<number>;
  // to avoid reparse
  // file modification time https://man7.org/linux/man-pages/man3/stat.3type.html
  mtime: number;
  // file hash
  checksum: number;
  // config hash
  cfghash: number;
  revision: number;
  // maybe enum?
  type: string | null;
  // -- public fileds --
  path: string;
  // for link resolution
  slug: string;
  url: string;
  updated_at: number; // Date?
  // content
  data: JSONColumnType<JsonObject>;
  ast: JSONColumnType<Node>;
}

interface LinkTable {
  id: Generated<number>;
  // edge for directed graph
  source: string;
  target: string;
  /**
   * Options to uniqlly identify link in the file
   * - **path + start.offset**
   * - autoincrement
   * - uuid-like (random)
   * - path + start.column + start.line
   */
  start: number;
  target_slug: string;
  target_url: string;
  target_path: string;
  target_anchor: string;
  line: number;
  column: number;
}

interface TaskTable {
  id: Generated<number>;
  source: string;
  /**
   * Options to uniqlly identify link in the file
   * - **path + start.offset**
   * - autoincrement
   * - uuid-like (random)
   * - path + start.column + start.line
   */
  start: number;
  ast: JSONColumnType<Node>;
  checked: number; // boolean?
  line: number;
  column: number;
}

// export type File = Selectable<FileTable>;

interface Database {
  files: FileTable;
  links: LinkTable;
  tasks: TaskTable;
}

export const getKysely = (database: SQLite) => {
  const dialect = new SqliteDialect({
    database,
  });
  return new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()]
  });
};

export type KyselyDb = Kysely<Database>;
