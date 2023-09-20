import { getFiles } from "./utils";
import { addFile } from "./addFile";
import { Queue } from "./queue";
import { Db } from "./db";

export function scanFolder(
  db: Db,
  q: Queue,
  pathToCrawl: string,
  cacheEnabled = true
) {
  return Promise.all(
    getFiles(pathToCrawl).map((file) => addFile(db, q, file, cacheEnabled))
  );
}
