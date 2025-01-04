import { and, eq, isNull, ne, sql, isNotNull, not } from "drizzle-orm";
import { files, links, tasks } from "./schema_drizzle.js";
import { Db } from "./db_drizzle.js";

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
    .select({ source: links.source, start: links.start })
    .from(links)
    .where(
      idPath === undefined
        ? isNull(links.target)
        : and(isNull(links.target), eq(links.source, idPath))
    )
    .all();
}

type GetFilesProps = {
  db: Db;
  idPath: string;
  selfLinks?: boolean;
};

/**
 * Incoming links
 */
export function getFilesFrom({
  db,
  idPath,
  selfLinks = false,
}: GetFilesProps) {
  return db
    .selectDistinct({ source: links.source })
    .from(links)
    .where(
      selfLinks
        ? eq(links.target, idPath)
        : and(eq(links.target, idPath), ne(links.source, idPath))
    )
    .all()
    .map((x) => x.source);
}

/**
 * Outgoing links
 */
export function getFilesTo({
  db,
  idPath,
  selfLinks = false,
}: GetFilesProps) {
  return db
    .selectDistinct({ to: links.target })
    .from(links)
    .where(
      and(
        isNotNull(links.target),
        selfLinks
          ? eq(links.source, idPath)
          : and(eq(links.source, idPath), ne(links.target, idPath))
      )
    )
    .all()
    .map((x) => x.to as string);
}

/**
 * Incoming and Outgoing links
 */
export function getConnectedFiles(props: GetFilesProps) {
  return [...new Set([...getFilesFrom(props), ...getFilesTo(props)])];
}

export function deleteFile(db: Db, idPath: string) {
  db.delete(files).where(eq(files.path, idPath)).run();
  db.delete(links).where(eq(links.source, idPath)).run();
  db.update(links).set({ target: null }).where(eq(links.target, idPath)).run();
  db.delete(tasks).where(eq(tasks.source, idPath)).run();
}

export function deleteOldRevision(db: Db, revision: number) {
  db.select({
    path: files.path,
  })
    .from(files)
    .where(not(eq(files.revision, revision)))
    .all()
    .forEach(({ path }) => {
      deleteFile(db, path);
    });
}
