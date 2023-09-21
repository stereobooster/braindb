import chokidar from "chokidar";
import { addFile } from "./addFile";
import { resolveLinks, unresolvedLinks } from "./resolveLinks";
import { deleteFile } from "./deleteFile";
import { Queue } from "./queue";
import { Db } from "./db";
import { link } from "./schema";
import { eq } from "drizzle-orm";

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
      symmetricDifference(linksBefore, linksAfter).map((x) =>
        q.push({ path: x, action: "update" })
      );
    })
    .on("unlink", (file) => {
      const path = "/" + file;
      const linksBefore = getLinksTo(db, path);

      deleteFile(db, path);
      q.push({ path, action: "delete" });

      symmetricDifference(linksBefore, []).map((x) =>
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

      symmetricDifference(linksBefore, linksAfter).map((x) =>
        q.push({ path: x, action: "update" })
      );
    });
}

const getLinksTo = (db: Db, path: string) =>
  db
    .selectDistinct({ from: link.from })
    .from(link)
    .where(eq(link.to, path))
    .all()
    .map((x) => x.from);

const symmetricDifference = <T>(arrayA: T[], arrayB: T[]) => {
  if (arrayA.length === 0) return arrayB;
  if (arrayB.length === 0) return arrayA;

  const setA = new Set(arrayA);
  const setB = new Set(arrayB);

  const diffA = arrayA.filter((x) => !setB.has(x));
  const diffB = arrayB.filter((x) => !setA.has(x));

  return [...diffA, ...diffB];
};
