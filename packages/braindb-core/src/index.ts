import mitt, { Emitter, Handler, WildcardHandler } from "mitt";
// @ts-ignore
import chokidar, { FSWatcher } from "chokidar";

import { Db, getDb } from "./db.js";
import { getLinksTo, resolveLinks } from "./resolveLinks.js";
import { addDocument } from "./addDocument.js";
import { symmetricDifference } from "./utils.js";
import { deleteDocument } from "./deleteDocument.js";
import { getMarkdown } from "./getMarkdown.js";
import { toDot } from "./toDot.js";
import { toGraphology } from "./toJson.js";
// import { document, link } from "./src/schema";

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
   * function to generate path (URL) a the document
   */
  url?: (filePath: string, frontmatter: Frontmatter) => string;
  /**
   * function to generate slug for a document
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
};

export type BrainDBOptionsOut = {
  linkType?: "PML" | "web";
  /**
   * If output use PML, sometimes it may be required to adjust them to the new root
   */
  transformPath?: (path: string) => string;
  /**
   *
   */
  transformFrontmatter?: (path: string, frontmatter: Frontmatter) => Frontmatter;
};

export class BrainDB {
  private cfg: BrainDBOptionsIn;
  private emitter: Emitter<Events>;
  private db: Db;
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

    if (this.cfg.cache === undefined) this.cfg.cache = true;

    // @ts-expect-error https://nodejs.org/api/events.html#eventtarget-and-event-api
    this.emitter = mitt<Events>();
    this.db = getDb(this.cfg.dbPath || ":memory:");
  }

  start() {
    if (this.watcher) throw new Error("Already started");

    this.initializing = true;
    // this will acumulate all files, which can be problematic
    // what if instead of array - fetch files from DB in the end
    this.initQueue = [];

    const fileToPathId = (file: string) =>
      (file.startsWith("/") ? file : "/" + file).replace(this.cfg.root, "");

    const files = `${this.cfg.root}${this.cfg.source}/**/*.md`;
    this.watcher = chokidar
      .watch(files, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
      })
      .on("error", (error: any) => console.log(`Watcher error: ${error}`))
      .on("ready", async () => {
        const res = await Promise.all(this.initQueue);
        this.initQueue = [];
        resolveLinks(this.db);
        this.initializing = false;

        res.forEach((path) => this.emitter.emit("create", { path }));
        this.emitter.emit("ready");
      })
      .on("add", async (file: string) => {
        const idPath = fileToPathId(file);

        if (this.initializing) {
          const p = addDocument(this.db, idPath, this.cfg).then(() => idPath);
          this.initQueue.push(p);
          await p;
          return;
        }

        const linksBefore = getLinksTo(this.db, idPath);

        await addDocument(this.db, idPath, this.cfg);
        this.emitter.emit("create", { path: idPath });

        resolveLinks(this.db);
        const linksAfter = getLinksTo(this.db, idPath);
        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path } as any)
        );
      })
      .on("unlink", (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getLinksTo(this.db, idPath);

        deleteDocument(this.db, idPath);
        this.emitter.emit("delete", { path: idPath });

        symmetricDifference(linksBefore, []).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      })
      .on("change", async (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getLinksTo(this.db, idPath);

        await addDocument(this.db, idPath, this.cfg);
        this.emitter.emit("update", { path: idPath });

        resolveLinks(this.db);
        const linksAfter = getLinksTo(this.db, idPath);

        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      });

    return this;
  }

  async stop() {
    if (this.watcher) await this.watcher.close();
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

  /**
   * returns graph as DOT
   */
  toDot() {
    return toDot(this.db);
  }

  /**
   * returns graph as JSON
   */
  toJson() {
    return toGraphology(this.db);
  }

  // experimental

  /**
   * Alternatively ther can be method to get document from the DB
   * and instance of the document would have `getMarkdown` method
   */
  getMarkdown(idPath: string, options: BrainDBOptionsOut = {}) {
    return getMarkdown(this.db, idPath, options);
  }

  // documents() {
  //   return this.db.select().from(document);
  // }

  // links() {
  //   return this.db.select().from(link);
  // }
}
