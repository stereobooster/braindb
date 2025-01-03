import { JsonObject } from "../types.js";
import type { Node } from "unist";
import { file } from "../schema.js";
import { Db } from "../db.js";

export type FileInsert = typeof file.$inferInsert;
export type InsertCb = (
  data: JsonObject,
  ast: Node,
  type: string | null
) => FileInsert;

export interface BasePlugin {
  process(db: Db, idPath: string, content: Buffer, insert: InsertCb): void;
  render(path: string): string;
}
