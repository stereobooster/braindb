import { readFile, stat } from "node:fs/promises";
import { dirname } from "node:path";
import type { Node } from "unist";
import { cheksum32, cheksumConfig, memoizeOnce } from "./utils.js";
import { deleteFile } from "./queries.js";
import { BrainDBOptionsIn } from "./index.js";
import { defaultGetSlug, defaultGetUrl } from "./defaults.js";
import { Repository } from "@napi-rs/simple-git";
import path from "node:path";
import { getPlugin } from "./plugins/index.js";
import { InsertCb } from "./plugins/base.js";
import { AllDb } from "./db.js";
import { FilesTable } from "./schema_kysely.js";

export const emptyAst: Node = {} as any;

const getRepo = memoizeOnce((path: string) => Repository.discover(path));
const getRepoPath = memoizeOnce((repo: Repository) => dirname(repo.path()));

export async function addFile(
  db: AllDb,
  idPath: string,
  cfg: BrainDBOptionsIn,
  revision: number
) {
  // maybe use prepared statement?
  const [existingFile] = await db.kysely
    .selectFrom("files")
    .select(["id", "path", "mtime", "checksum", "cfghash"])
    .where("path", "=", idPath)
    .execute();
  const { ext } = path.parse(idPath);

  const absolutePath = cfg.root + idPath;
  // https://nodejs.org/api/fs.html#class-fsstats
  const st = await stat(absolutePath);
  const mtime = st.mtimeMs;
  let checksum = 0;
  let content: Buffer | null = null;
  let cfghash = 0;

  if (cfg.cache) {
    cfghash = cheksumConfig(cfg);
    // https://ziglang.org/download/0.4.0/release-notes.html#Build-Artifact-Caching
    const trustedTimestamp =
      existingFile && Math.abs(existingFile.mtime - Date.now()) > 1000;
    if (
      existingFile &&
      trustedTimestamp &&
      existingFile.cfghash === cfghash &&
      existingFile.mtime === mtime
    ) {
      await db.kysely
        .updateTable("files")
        .set({ revision /*, updated_at */ })
        .where("path", "=", idPath);
      return;
    }

    content = await readFile(absolutePath);
    checksum = cheksum32(content);
    if (
      existingFile &&
      existingFile.cfghash === cfghash &&
      existingFile.checksum === checksum
    ) {
      await db.kysely
        .updateTable("files")
        .set({ revision /*, updated_at */ })
        .where("path", "=", idPath);
      return;
    }
  } else {
    content = await readFile(absolutePath);
  }

  let updated_at = Math.round(mtime);
  if (cfg.git) {
    // TODO: maybe, if file is modified use `mtimeMs` instead of git date?
    try {
      const repo = getRepo(cfg.root);
      updated_at = await repo.getFileLatestModifiedDateAsync(
        absolutePath.replace(getRepoPath(repo) + "/", "")
      );
    } catch (e) {
      // TODO: maybe config logger?
      // TODO: use LRU or Bloom filter to report warning only once
      console.log(`Warning: ${e}`);
    }
  }

  const insert: InsertCb = async (data, ast, type) => {
    const getUrl = cfg.url || defaultGetUrl;
    const getSlug = cfg.slug || defaultGetSlug;

    const newFile = {
      id: existingFile?.id as any,
      data: data as any,
      path: idPath,
      ast: cfg.storeMarkdown === false ? emptyAst : (ast as any),
      mtime,
      checksum,
      cfghash,
      url: getUrl(idPath, data),
      slug: getSlug(idPath, data),
      updated_at,
      revision,
      type,
    } satisfies FilesTable;

    if (existingFile) deleteFile(db, idPath);

    // it stucks here
    await db.kysely.insertInto("files").values(newFile).execute();

    return newFile;
  };

  const plugin = getPlugin(ext);
  if (plugin) {
    await plugin.process(db, idPath, content, insert);
  } else {
    await insert({}, emptyAst, null);
  }
}
