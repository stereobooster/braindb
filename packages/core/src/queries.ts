import { and, eq, isNull, ne, sql, isNotNull, not } from "drizzle-orm";
import { file, link, task } from "./schema.js";
import { Db } from "./db.js";

export function resolveLinks(db: Db) {
  // TODO: check for ambiguous: slugs, urls
  // Maybe update would be better than replace?
  db.run(
    sql`
  REPLACE INTO links
  SELECT
    links.id,
    links.source,
    files.path as target,
    links.start,
    links.target_slug,
    links.target_url,
    links.target_path,
    links.target_anchor,
    links.line,
    links.column
  FROM links INNER JOIN files ON
      links.target_slug = files.slug OR
      links.target_url = files.url OR
      links.target_path = files.path
  WHERE links.target IS NULL;`
  );
}

export function unresolvedLinks(db: Db, idPath?: string) {
  return db
    .select({ source: link.source, start: link.start })
    .from(link)
    .where(
      idPath === undefined
        ? isNull(link.target)
        : and(isNull(link.target), eq(link.source, idPath))
    )
    .all();
}

type GetDocumentsProps = {
  db: Db;
  idPath: string;
  selfLinks?: boolean;
};

/**
 * Incoming links
 */
export function getDocumentsFrom({
  db,
  idPath,
  selfLinks = false,
}: GetDocumentsProps) {
  return db
    .selectDistinct({ source: link.source })
    .from(link)
    .where(
      selfLinks
        ? eq(link.target, idPath)
        : and(eq(link.target, idPath), ne(link.source, idPath))
    )
    .all()
    .map((x) => x.source);
}

/**
 * Outgoing links
 */
export function getDocumentsTo({
  db,
  idPath,
  selfLinks = false,
}: GetDocumentsProps) {
  return db
    .selectDistinct({ to: link.target })
    .from(link)
    .where(
      and(
        isNotNull(link.target),
        selfLinks
          ? eq(link.source, idPath)
          : and(eq(link.source, idPath), ne(link.target, idPath))
      )
    )
    .all()
    .map((x) => x.to as string);
}

/**
 * Incoming and Outgoing links
 */
export function getConnectedDocuments(props: GetDocumentsProps) {
  return [...new Set([...getDocumentsFrom(props), ...getDocumentsTo(props)])];
}

export function deleteDocument(db: Db, idPath: string) {
  db.delete(file).where(eq(file.path, idPath)).run();
  db.delete(link).where(eq(link.source, idPath)).run();
  db.update(link).set({ target: null }).where(eq(link.target, idPath)).run();
  db.delete(task).where(eq(task.source, idPath)).run();
}

export function deleteOldRevision(db: Db, revision: number) {
  db.select({
    path: file.path,
  })
    .from(file)
    .where(not(eq(file.revision, revision)))
    .all()
    .forEach(({ path }) => {
      deleteDocument(db, path);
    });
}
