import { type Database as SQLite } from "better-sqlite3";
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from "kysely";
import { Generated, JSONColumnType } from "kysely";
import type { Node } from "unist";
import { JsonObject } from "./types.js";

export interface FilesTable {
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

interface LinksTable {
  id: Generated<number>;
  // edge for directed graph
  source: string;
  /**
   * Options to uniqlly identify link in the file
   * - **path + start.offset**
   * - autoincrement
   * - uuid-like (random)
   * - path + start.column + start.line
   */
  start: number;
  target: string | null;
  target_slug: string | null;
  target_url: string | null;
  target_path: string | null;
  target_anchor: string | null;
  line: number;
  column: number;
}

interface TasksTable {
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
  files: FilesTable;
  links: LinksTable;
  tasks: TasksTable;
}

export const getKysely = (database: SQLite) => {
  const dialect = new SqliteDialect({
    database,
  });
  return new Kysely<Database>({
    dialect,
    plugins: [new ParseJSONResultsPlugin()],
  });
};

export type KyselyDb = Kysely<Database>;
