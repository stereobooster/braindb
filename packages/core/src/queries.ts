import { AllDb } from "./db.js";
import {
  DeleteQueryBuilder,
  SelectQueryBuilder,
  UpdateQueryBuilder,
} from "kysely";

/**
 * some dark magic
 */
function syncDelete<DB, TB extends keyof DB, O>(
  db: AllDb,
  query: DeleteQueryBuilder<DB, TB, O>,
  ...params: any[]
) {
  return db.sqlite.prepare(query.compile().sql).run(params);
}

function syncUpdate<DB, UT extends keyof DB, TB extends keyof DB, O>(
  db: AllDb,
  query: UpdateQueryBuilder<DB, UT, TB, O>,
  ...params: any[]
): Awaited<ReturnType<UpdateQueryBuilder<DB, UT, TB, O>["execute"]>> {
  return db.sqlite.prepare(query.compile().sql).run(params) as any;
}

function syncSelect<DB, TB extends keyof DB, O>(
  db: AllDb,
  query: SelectQueryBuilder<DB, TB, O>,
  ...params: any[]
): Awaited<ReturnType<SelectQueryBuilder<DB, TB, O>["execute"]>> {
  return db.sqlite.prepare(query.compile().sql).run(params) as any;
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
    ? syncSelect(db, query, null)
    : syncSelect(db, query.where("source", "=", idPath), null, idPath);
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
      ? syncSelect(db, query, idPath)
      : syncSelect(db, query.where("source", "!=", idPath), idPath, idPath)
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
      ? syncSelect(db, query, null, idPath)
      : syncSelect(
          db,
          query.where("target", "!=", idPath),
          null,
          idPath,
          idPath
        )
  ).map((x) => x.target) as string[];
}

/**
 * Incoming and Outgoing links
 */
export function getConnectedFiles(props: GetFilesProps) {
  return [...new Set([...getFilesFrom(props), ...getFilesTo(props)])];
}

export function deleteFile(db: AllDb, idPath: string) {
  syncDelete(
    db,
    db.kysely.deleteFrom("files").where("path", "=", idPath),
    idPath
  );
  syncDelete(
    db,
    db.kysely.deleteFrom("links").where("source", "=", idPath),
    idPath
  );
  syncUpdate(
    db,
    db.kysely
      .updateTable("links")
      .set({ target: null })
      .where("target", "=", idPath),
    null,
    idPath
  );
  syncDelete(
    db,
    db.kysely.deleteFrom("tasks").where("source", "=", idPath),
    idPath
  );
}

export function deleteOldRevision(db: AllDb, revision: number) {
  syncSelect(
    db,
    db.kysely
      .selectFrom("files")
      .select(["path"])
      .where("revision", "!=", revision),
    revision
  ).forEach(({ path }) => deleteFile(db, path));
}
