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
    getFiles(pathToCrawl).map(async (file) => {
      const path = "/" + file;
      await addFile(db, path, cacheEnabled)
      q.push({ path, action: "add" });
    })

  );
}
