import mitt, { Emitter, Handler, WildcardHandler } from "mitt";
// @ts-ignore
import chokidar, { FSWatcher } from "chokidar";

import { Db, getDb } from "./db.js";
import { getConnectedDocuments, resolveLinks } from "./resolveLinks.js";
import { addDocument } from "./addDocument.js";
import { symmetricDifference } from "./utils.js";
import { deleteDocument } from "./deleteDocument.js";
import { Document } from "./Document.js";
import { document, link } from "./schema.js";
import { eq } from "drizzle-orm";
import { mkdirp } from "mkdirp";
import { join } from "node:path";
import { Link } from "./Link.js";
// import { document, link } from "./src/schema";

// TODO: action in the event itself, so it would be easier to match on it
type Events = {
  update: { document: Document };
  delete: { document: Document };
  create: { document: Document };
  ready: void;
};

export { Document };

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
  transformFrontmatter?: (doc: Document) => Frontmatter;
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
    if (this.cfg.dbPath) {
      let dbPath = join(this.cfg.dbPath, ".braindb");
      mkdirp.sync(dbPath);
      this.db = getDb(join(dbPath, "db.sqlite"));
    } else {
      this.db = getDb(":memory:");
    }
  }

  start() {
    if (this.watcher) throw new Error("Already started");

    this.initializing = true;
    // this will acumulate all files, which can be problematic
    // what if instead of array - fetch files from DB in the end
    this.initQueue = [];

    const fileToPathId = (file: string) =>
      (file.startsWith("/") ? file : "/" + file).replace(this.cfg.root, "");

    const files = `${this.cfg.root}${this.cfg.source}/**/*.{md,mdx}`;
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

        res.forEach((path) =>
          this.emitter.emit("create", { document: new Document(this.db, path) })
        );
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

        const linksBefore = getConnectedDocuments({
          db: this.db,
          idPath,
        });

        await addDocument(this.db, idPath, this.cfg);
        resolveLinks(this.db);
        this.emitter.emit("create", {
          document: new Document(this.db, idPath),
        });

        const linksAfter = getConnectedDocuments({
          db: this.db,
          idPath,
        });

        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path } as any)
        );
      })
      .on("unlink", (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getConnectedDocuments({
          db: this.db,
          idPath,
        });

        deleteDocument(this.db, idPath);
        this.emitter.emit("delete", {
          document: new Document(this.db, idPath),
        });

        symmetricDifference(linksBefore, []).forEach((path) =>
          this.emitter.emit("update", { document: new Document(this.db, path) })
        );
      })
      .on("change", async (file: string) => {
        const idPath = fileToPathId(file);

        const linksBefore = getConnectedDocuments({
          db: this.db,
          idPath,
        });

        await addDocument(this.db, idPath, this.cfg);
        resolveLinks(this.db);
        this.emitter.emit("update", {
          document: new Document(this.db, idPath),
        });

        const linksAfter = getConnectedDocuments({
          db: this.db,
          idPath,
        });

        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { document: new Document(this.db, path) })
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

  private ready() {
    return this.initializing
      ? new Promise((resolve) => {
          // @ts-expect-error TS is wrong
          this.on("ready", () => resolve());
        })
      : Promise.resolve();
  }

  async documents() {
    await this.ready();
    return this.db
      .select({ path: document.path })
      .from(document)
      .all()
      .map(({ path }) => new Document(this.db, path));
  }

  async findDocument(path: string) {
    await this.ready();
    return this.db
      .select({ path: document.path })
      .from(document)
      .where(eq(document.path, path))
      .all()
      .map(({ path }) => new Document(this.db, path))[0];
  }

  async links() {
    await this.ready();
    return this.db
      .select({ from: link.from, start: link.start })
      .from(link)
      .all()
      .map(({ from, start }) => new Link(this.db, from, start));
  }
}
