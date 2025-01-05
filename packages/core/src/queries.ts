import { AllDb } from "./db.js";
import {
  DeleteQueryBuilder,
  InsertQueryBuilder,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "kysely";

function syncDelete<DB, TB extends keyof DB, O>(
  db: AllDb,
  query: DeleteQueryBuilder<DB, TB, O>
) {
  const c = query.compile();
  const params = c.parameters.map((x) =>
    typeof x === "object" && x !== null ? JSON.stringify(x) : x
  );
  db.sqlite.prepare(c.sql).run(...params);
}

export function syncUpdate<DB, UT extends keyof DB, TB extends keyof DB, O>(
  db: AllDb,
  query: UpdateQueryBuilder<DB, UT, TB, O>
) {
  const c = query.compile();
  const params = c.parameters.map((x) =>
    typeof x === "object" && x !== null ? JSON.stringify(x) : x
  );
  db.sqlite.prepare(c.sql).run(...params);
}

export function syncInsert<DB, TB extends keyof DB, O>(
  db: AllDb,
  query: InsertQueryBuilder<DB, TB, O>
) {
  const c = query.compile();
  const params = c.parameters.map((x) =>
    typeof x === "object" && x !== null ? JSON.stringify(x) : x
  );
  db.sqlite.prepare(c.sql).run(...params);
}

export function syncSelect<DB, TB extends keyof DB, O>(
  db: AllDb,
  query: SelectQueryBuilder<DB, TB, O>
): Awaited<ReturnType<SelectQueryBuilder<DB, TB, O>["execute"]>> {
  const c = query.compile();
  const params = c.parameters.map((x) =>
    typeof x === "object" && x !== null ? JSON.stringify(x) : x
  );
  return db.sqlite.prepare(c.sql).all(...params) as any;
}

export function resolveLinks(db: AllDb) {
  // TODO: check for ambiguous: slugs, urls
  // Maybe update would be better than replace?
  db.sqlite.exec(`
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
  WHERE links.target IS NULL;`);
}

export function unresolvedLinks(db: AllDb, idPath?: string) {
  const query = db.kysely
    .selectFrom("links")
    .select(["source", "start"])
    .where("target", "is", null);

  return idPath === undefined
    ? syncSelect(db, query)
    : syncSelect(db, query.where("source", "=", idPath));
}

type GetFilesProps = {
  db: AllDb;
  idPath: string;
  selfLinks?: boolean;
};

/**
 * Incoming links
 */
export function getFilesFrom({ db, idPath, selfLinks = false }: GetFilesProps) {
  const query = db.kysely
    .selectFrom("links")
    .select(["source"])
    .distinct()
    .where("target", "=", idPath);

  return (
    selfLinks
      ? syncSelect(db, query)
      : syncSelect(db, query.where("source", "!=", idPath))
  ).map((x) => x.source);
}

/**
 * Outgoing links
 */
export function getFilesTo({ db, idPath, selfLinks = false }: GetFilesProps) {
  const query = db.kysely
    .selectFrom("links")
    .select(["target"])
    .distinct()
    .where("target", "is not", null)
    .where("source", "=", idPath);

  return (
    selfLinks
      ? syncSelect(db, query)
      : syncSelect(db, query.where("target", "!=", idPath))
  ).map((x) => x.target) as string[];
}

/**
 * Incoming and Outgoing links
 */
export function getConnectedFiles(props: GetFilesProps) {
  return [...new Set([...getFilesFrom(props), ...getFilesTo(props)])];
}

export function deleteFile(db: AllDb, idPath: string) {
  syncDelete(db, db.kysely.deleteFrom("files").where("path", "=", idPath));
  syncDelete(db, db.kysely.deleteFrom("links").where("source", "=", idPath));
  syncUpdate(
    db,
    db.kysely
      .updateTable("links")
      .set({ target: null })
      .where("target", "=", idPath)
  );
  syncDelete(db, db.kysely.deleteFrom("tasks").where("source", "=", idPath));
}

export function deleteOldRevision(db: AllDb, revision: number) {
  syncSelect(
    db,
    db.kysely
      .selectFrom("files")
      .select(["path"])
      .where("revision", "!=", revision)
  ).forEach(({ path }) => deleteFile(db, path));
}
