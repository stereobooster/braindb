import { fdir } from "fdir";
import { addFile } from "./addFile";
import { Queue } from "./types";
import { Db } from "./db";
import { Config } from "./config";

export const getFiles = (pathToCrawl: string) => {
  // TODO: is there way to skip scanning folders if mtime didn't change?
  const crawler = new fdir()
    .withBasePath()
    .filter((path, _isDirectory) => path.endsWith(".md"));

  return crawler.crawl(pathToCrawl).sync();
};

export function scanFolder(db: Db, q: Queue, cfg: Config) {
  return Promise.all(
    getFiles(cfg.source).map(async (file) => {
      const path = "/" + file;
      await addFile(db, path, cfg);
      q.push({ path, action: "add" });
    })
  );
}
