import { getFiles } from "./utils";
import { addFile } from "./addFile";
import { Queue } from "./queue";
import { Db } from "./db";
import { Config } from "./config";

export function scanFolder(
  db: Db,
  q: Queue,
  pathToCrawl: string,
  cacheEnabled = true,
  generateUrl: Config["generateUrl"]
) {
  return Promise.all(
    getFiles(pathToCrawl).map(async (file) => {
      const path = "/" + file;
      await addFile(db, path, cacheEnabled, generateUrl)
      q.push({ path, action: "add" });
    })

  );
}
