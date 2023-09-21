import chokidar from "chokidar";
import { addFile } from "./addFile";
import { getLinksTo, resolveLinks } from "./resolveLinks";
import { deleteFile } from "./deleteFile";
import { Queue } from "./queue";
import { Db } from "./db";

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
    .on("ready", () => console.log(`Watching files`))
    .on("add", async (file) => {
      const path = "/" + file;
      const linksBefore = getLinksTo(db, path);

      await addFile(db, path, cacheEnabled);
      q.push({ path, action: "add" });

      resolveLinks(db);
      const linksAfter = getLinksTo(db, path);
      symmetricDifference(linksBefore, linksAfter).forEach((x) =>
        q.push({ path: x, action: "update" })
      );
    })
    .on("unlink", (file) => {
      const path = "/" + file;
      const linksBefore = getLinksTo(db, path);

      deleteFile(db, path);
      q.push({ path, action: "delete" });

      symmetricDifference(linksBefore, []).forEach((x) =>
        q.push({ path: x, action: "update" })
      );
    })
    .on("change", async (file) => {
      const path = "/" + file;
      const linksBefore = getLinksTo(db, path);

      await addFile(db, path, cacheEnabled);
      q.push({ path, action: "update" });

      resolveLinks(db);
      const linksAfter = getLinksTo(db, path);

      symmetricDifference(linksBefore, linksAfter).forEach((x) =>
        q.push({ path: x, action: "update" })
      );
    });
}

const symmetricDifference = <T>(arrayA: T[], arrayB: T[]) => {
  if (arrayA.length === 0) return arrayB;
  if (arrayB.length === 0) return arrayA;

  const setA = new Set(arrayA);
  const setB = new Set(arrayB);

  const diffA = arrayA.filter((x) => !setB.has(x));
  const diffB = arrayB.filter((x) => !setA.has(x));

  return [...diffA, ...diffB];
};
