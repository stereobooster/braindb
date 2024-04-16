import { document, link, task } from "./schema.js";
import { eq, not } from "drizzle-orm";
import { Db } from "./db.js";

export function deleteDocument(db: Db, idPath: string) {
  db.delete(document).where(eq(document.path, idPath)).run();
  db.delete(link).where(eq(link.from, idPath)).run();
  db.update(link).set({ to: null }).where(eq(link.to, idPath)).run();
  db.delete(task).where(eq(task.from, idPath)).run();
}

export function deleteOldRevision(db: Db, revision: number) {
  db.select({
    path: document.path,
  })
    .from(document)
    .where(not(eq(document.revision, revision)))
    .all()
    .forEach(({ path }) => {
      deleteDocument(db, path);
    });
}
