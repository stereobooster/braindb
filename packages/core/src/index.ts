import mitt, { Emitter, Handler, WildcardHandler } from "mitt";
// @ts-ignore
import chokidar, { FSWatcher } from "chokidar";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import Database from "better-sqlite3";
import { Db, getDrizzle } from "./db.js";
import {
  getConnectedFiles,
  resolveLinks,
  deleteFile,
  deleteOldRevision,
} from "./queries.js";
import { addFile } from "./addFile.js";
import { symmetricDifference } from "./utils.js";
import { getKysely, KyselyDb } from "./schema_kysely.js";

// TODO: action in the event itself, so it would be easier to match on it
type Events = {
  update: { path: string };
  delete: { path: string };
  create: { path: string };
  ready: void;
};

export type Frontmatter = Record<string, unknown>;

export type BrainDBOptionsIn = {
  /**
   * If `dbPath` is present, than DB would be persited to the disc and used as cache on the next run
   */
  dbPath?: string;
  /**
   * Even if `dbPath` is absent, and DB stored in memory it can be long runing process and cache can be used
   */
  cache?: boolean;
  /**
   * function to generate path (URL) a the file
   */
  url?: (filePath: string, frontmatter: Frontmatter) => string;
  /**
   * function to generate slug for a file
   */
  slug?: (filePath: string, frontmatter: Frontmatter) => string;
  /**
   * root of the project
   */
  root: string;
  /**
   * source files
   */
  source?: string;
  /**
   * if `true` will use git date for `updated_at` field.
   * It will search for git repo in `root` or any parent directory
   */
  git?: boolean;
  /**
   * if you never use File's `markdown` and `text`
   * you can set this to `false` in order to save some memory
   */
  storeMarkdown?: boolean;
};

export type BrainDBOptionsOut = {
  linkType?: "PML" | "web";
  /**
   * If output use PML, sometimes it may be required to adjust them to the new root
   */
  transformPath?: (path: string) => string;
  transformFrontmatter?: (path: string) => Frontmatter;
  /**
   * experimental
   * @param path string
   * @param node mdast node
   * @returns undefined | mdast node
   */
  transformUnresolvedLink?: (path: string, node: any) => any;
};

export class BrainDB {
  private cfg: BrainDBOptionsIn;
  private emitter: Emitter<Events>;
  private db: Db;
  private kyselyDb: KyselyDb;
  private watcher: FSWatcher | undefined;
  private initializing = true;
  private initQueue: Promise<string>[] = [];

  constructor(cfg: BrainDBOptionsIn) {
    this.cfg = cfg;
    this.cfg.root = this.cfg.root.replace(/\/$/, "");

    if (this.cfg.source === undefined) this.cfg.source = "";
    this.cfg.source = this.cfg.source.replace(/\/$/, "");
    if (this.cfg.source && !this.cfg.source.startsWith("/"))
      this.cfg.source = "/" + this.cfg.source;

    if (this.cfg.cache === undefined) this.cfg.cache = Boolean(this.cfg.dbPath);

    // @ts-expect-error https://nodejs.org/api/events.html#eventtarget-and-event-api
    this.emitter = mitt<Events>();
    let dbPath = ":memory:";
    if (this.cfg.dbPath) {
      dbPath = join(this.cfg.dbPath, ".braindb");
      mkdirSync(dbPath, { recursive: true });
      dbPath = join(dbPath, "db.sqlite");
    }
    const sqlite = new Database(dbPath);
    this.db = getDrizzle(sqlite);
    this.kyselyDb = getKysely(sqlite);
  }

  start(silent?: boolean) {
    if (this.watcher)
      if (silent) return this;
      else throw new Error("Already started");

    const revision = new Date().getTime();

    this.initializing = true;
    // this will acumulate all files, which can be problematic
    // what if instead of array - fetch files from DB in the end
    this.initQueue = [];

    const fileToPathId = (file: string) =>
      (file.startsWith("/") ? file : "/" + file).replace(this.cfg.root, "");

    const files = `${this.cfg.root}${this.cfg.source}/`;
    const dotfilesRegex = /(^|[\/\\])\../;

    this.watcher = chokidar
      .watch(files, {
        ignored: (path, stats) => {
          return (stats?.isFile() &&
            !(path.endsWith(".md") || path.endsWith(".mdx")) &&
            !dotfilesRegex.test(path)) as boolean;
        },
        persistent: true,
      })
      .on("error", (error: any) => console.log(`Watcher error: ${error}`))
      .on("ready", async () => {
        const res = await Promise.all(this.initQueue);
        this.initQueue = [];
        deleteOldRevision(this.db, revision);
        resolveLinks(this.db);
        this.initializing = false;

        res.forEach((path) => this.emitter.emit("create", { path }));
        this.emitter.emit("ready");
      })
      .on("add", async (file: string) => {
        const idPath = fileToPathId(file);

        if (this.initializing) {
          const p = addFile(this.db, idPath, this.cfg, revision).then(
            () => idPath
          );
          this.initQueue.push(p);
          await p;
          return;
        }

        const linksBefore = getConnectedFiles({
          db: this.db,
          idPath,
        });

        await addFile(this.db, idPath, this.cfg, revision);
        resolveLinks(this.db);
        this.emitter.emit("create", {
          path: idPath,
        });

        const linksAfter = getConnectedFiles({
          db: this.db,
          idPath,
        });

        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path } as any)
        );
      })
      .on("unlink", (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getConnectedFiles({
          db: this.db,
          idPath,
        });

        deleteFile(this.db, idPath);
        this.emitter.emit("delete", {
          path: idPath,
        });

        symmetricDifference(linksBefore, []).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      })
      .on("change", async (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getConnectedFiles({
          db: this.db,
          idPath,
        });

        await addFile(this.db, idPath, this.cfg, revision);
        resolveLinks(this.db);
        this.emitter.emit("update", {
          path: idPath,
        });

        const linksAfter = getConnectedFiles({
          db: this.db,
          idPath,
        });

        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      });

    return this;
  }

  async stop() {
    if (this.watcher) await this.watcher.close();
    this.watcher = undefined;
    this.initQueue = [];
    return this;
  }

  on(type: "*", handler: WildcardHandler<Events>): this;
  on<Key extends keyof Events>(type: Key, handler: Handler<Events[Key]>) {
    this.emitter.on(type, handler);
    return this;
  }

  off(type: "*", handler: WildcardHandler<Events>): this;
  off<Key extends keyof Events>(type: Key, handler?: Handler<Events[Key]>) {
    this.emitter.off(type, handler);
    return this;
  }

  ready() {
    if (!this.watcher) return Promise.reject(new Error("BraindDB not started"));

    return this.initializing
      ? new Promise((resolve) => {
          // @ts-expect-error TS is wrong
          this.on("ready", () => resolve());
        })
      : Promise.resolve();
  }

  // deprecate if Kysely option would work
  query() {
    return this.db.query;
  }

  // experimental
  kysely() {
    return this.kyselyDb;
  }

  // this is experimental - do not use it
  __rawQuery(query: string) {
    return this.db.all(sql.raw(query));
  }
}
