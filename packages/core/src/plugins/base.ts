import { JsonObject } from "../types.js";
import type { Node } from "unist";
import { AllDb } from "../db.js";
import { FilesTable } from "../schema_kysely.js";

export type InsertCb = (
  data: JsonObject,
  ast: Node,
  type: string | null
) => FilesTable;

export interface BasePlugin {
  // 1. this probably should be async
  // 2. maybe avoid passing `content`?
  process(db: AllDb, idPath: string, content: Buffer, insert: InsertCb): void;
  render(path: string): string;
}
