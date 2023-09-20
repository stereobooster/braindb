import chokidar from "chokidar";
import { addFile } from "./addFile";
import { resolveLinks, unresolvedLinks } from "./resolveLinks";
import { deleteFile } from "./deleteFile";
import { Queue } from "./queue";
import { Db } from "./db";

// TODO: add to queue for file regeneration
export function watchFolder(
  db: Db,
  q: Queue,
  pathToCrawl: string,
  cacheEnabled = true
) {
  return chokidar
    .watch(`${pathToCrawl}/**/*.md`, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    })
    .on("add", async (path) => {
      await addFile(db, q, path, cacheEnabled);
      resolveLinks(db);
      // console.log(unresolvedLinks(db));
    })
    .on("change", async (path) => {
      // this needs to be more sophisticated
      await addFile(db, q, path, cacheEnabled);
      resolveLinks(db);
    })
    .on("unlink", (path) => {
      const filesToUpdate = deleteFile(db, path);
      q.push({ path, action: "delete" });
      filesToUpdate.map((x) => q.push({ path: x, action: "update" }));
    })
    .on("ready", () => console.log(`Watching files`));
}
