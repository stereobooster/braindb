import { getFiles } from "./utils";
import { addFile } from "./addFile";
import { Queue } from "./queue";
import { Db } from "./db";
import { Config } from "./config";

export function scanFolder(db: Db, q: Queue, cfg: Config) {
  return Promise.all(
    getFiles(cfg.source).map(async (file) => {
      const path = "/" + file;
      await addFile(db, path, cfg);
      q.push({ path, action: "add" });
    })
  );
}
