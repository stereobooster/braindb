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
  // to track deleted files when BrainDB wasn't running
  revision: number;
  // which plugin
  type: string | null;
  ast: JSONColumnType<Node>;
  // -- public fileds --
  path: string;
  // for link resolution
  slug: string;
  url: string;
  updated_at: number; // Date?
  // content
  data: JSONColumnType<JsonObject>;
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

export interface Database {
  files: FilesTable;
  links: LinksTable;
  tasks: TasksTable;
}
