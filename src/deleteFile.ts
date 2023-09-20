import { document, link } from "./schema";
import { eq } from "drizzle-orm";
import { Db } from "./db";

export function deleteFile(db: Db, file: string) {
  const path = "/" + file;
  db.delete(document).where(eq(document.path, path)).run();
  db.delete(link).where(eq(link.from, path)).run();

  const filesToUpdate = [
    ...new Set(
      db
        .select({ from: link.from })
        .from(link)
        .where(eq(link.to, path))
        .all()
        .map((x) => x.from)
    ),
  ];

  db.update(link).set({ to: null }).where(eq(link.to, path)).run();
  return filesToUpdate;
}
