import { JsonObject } from "../types.js";
import type { Node } from "unist";
import { files } from "../schema_drizzle.js";
import { Db } from "../db_drizzle.js";

export type FileInsert = typeof files.$inferInsert;
export type InsertCb = (
  data: JsonObject,
  ast: Node,
  type: string | null
) => FileInsert;

export interface BasePlugin {
  process(db: Db, idPath: string, content: Buffer, insert: InsertCb): void;
  render(path: string): string;
}
