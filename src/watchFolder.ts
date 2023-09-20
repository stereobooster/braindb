import type { queue } from "fastq";
import chokidar from "chokidar";
import { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { addFile } from "./addFile";
import { resolveLinks, unresolvedLinks } from "./resolveLinks";
import { removeFile } from "./removeFile";

// TODO: add to queue for file regeneration
export function watchFolder<T extends Record<string, unknown>>(
  db: BunSQLiteDatabase<T>,
  q: queue,
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
      removeFile(db, path);
      q.push({ path, action: "delete" });
    })
    .on("ready", () => console.log(`Watching files`));
}
