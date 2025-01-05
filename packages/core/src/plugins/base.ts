import { JsonObject } from "../types.js";
import type { Node } from "unist";
import { AllDb } from "../db.js";
import { FilesTable } from "../schema_kysely.js";

export type InsertCb = (
  data: JsonObject,
  ast: Node,
  type: string | null
) => Promise<FilesTable>;

export interface BasePlugin {
  process(db: AllDb, idPath: string, content: Buffer, insert: InsertCb): Promise<void>;
  render(path: string): string;
}
