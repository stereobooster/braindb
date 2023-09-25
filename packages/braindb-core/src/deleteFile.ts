import { document, link } from "./schema";
import { eq } from "drizzle-orm";
import { Db } from "./db";

export function deleteFile(db: Db, path: string) {
  db.delete(document).where(eq(document.path, path)).run();
  db.delete(link).where(eq(link.from, path)).run();
  db.update(link).set({ to: null }).where(eq(link.to, path)).run();
}
