import { document, link } from "./schema.js";
import { eq, not } from "drizzle-orm";
import { Db } from "./db.js";

export function deleteDocument(db: Db, idPath: string) {
  db.delete(document).where(eq(document.path, idPath)).run();
  db.delete(link).where(eq(link.from, idPath)).run();
  db.update(link).set({ to: null }).where(eq(link.to, idPath)).run();
}

export function deleteOldRevision(db: Db, revision: number) {
  db.delete(document)
    .where(not(eq(document.revision, revision)))
    .run();
  db.delete(link)
    .where(not(eq(link.revision, revision)))
    .run();
}
