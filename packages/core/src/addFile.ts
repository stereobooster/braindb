import { readFile, stat } from "node:fs/promises";
import { dirname } from "node:path";
import { eq } from "drizzle-orm";
import type { Node } from "unist";
import { file } from "./schema.js";
import { cheksum32, cheksumConfig, memoizeOnce } from "./utils.js";
import { deleteFile } from "./queries.js";
import { Db } from "./db.js";
import { BrainDBOptionsIn } from "./index.js";
import { defaultGetSlug, defaultGetUrl } from "./defaults.js";
import { Repository } from "@napi-rs/simple-git";
import path from "node:path";
import { getPlugin } from "./plugins/index.js";
import { InsertCb } from "./plugins/base.js";

export const emptyAst: Node = {} as any;

const getRepo = memoizeOnce((path: string) => Repository.discover(path));
const getRepoPath = memoizeOnce((repo: Repository) => dirname(repo.path()));

export async function addFile(
  db: Db,
  idPath: string,
  cfg: BrainDBOptionsIn,
  revision: number
) {
  // maybe use prepared statement?
  const [existingFile] = db
    .select({
      id: file.id,
      path: file.path,
      mtime: file.mtime,
      checksum: file.checksum,
      cfghash: file.cfghash,
    })
    .from(file)
    .where(eq(file.path, idPath))
    .all();
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
      await db
        .update(file)
        .set({ revision /*, updated_at */ })
        .where(eq(file.path, idPath));
      return;
    }

    content = await readFile(absolutePath);
    checksum = cheksum32(content);
    if (
      existingFile &&
      existingFile.cfghash === cfghash &&
      existingFile.checksum === checksum
    ) {
      await db
        .update(file)
        .set({ revision /*, updated_at */ })
        .where(eq(file.path, idPath));
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

  const insert: InsertCb = (data, ast, type) => {
    const getUrl = cfg.url || defaultGetUrl;
    const getSlug = cfg.slug || defaultGetSlug;

    const newFile = {
      id: existingFile?.id,
      data: data,
      path: idPath,
      ast: cfg.storeMarkdown === false ? emptyAst : ast,
      mtime,
      checksum,
      cfghash,
      url: getUrl(idPath, data),
      slug: getSlug(idPath, data),
      updated_at,
      revision,
      type,
    } satisfies typeof file.$inferInsert;

    if (existingFile) deleteFile(db, idPath);

    db.insert(file)
      .values(newFile)
      .onConflictDoUpdate({ target: file.path, set: newFile })
      .run();

    return newFile;
  };

  const plugin = getPlugin(ext);
  if (plugin) {
    plugin.process(db, idPath, content, insert);
  } else {
    insert({}, emptyAst, null);
  }
}
