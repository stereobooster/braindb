import mitt, { Emitter, Handler, WildcardHandler } from "mitt";
import chokidar, { FSWatcher } from "chokidar";

import { Db, getDb } from "./src/db";
import { getLinksTo, resolveLinks } from "./src/resolveLinks";
import { addFile } from "./src/addFile";
import { symmetricDifference } from "./src/utils";
import { deleteFile } from "./src/deleteFile";
import { generateFile } from "./src/generateFile";
import { toDot } from "./src/toDot";
import { toCyjs, toGraphology } from "./src/toJson";
// import { document, link } from "./src/schema";

// TODO: action in the event itself, so it would be easier to match on it
type Events = {
  update: { path: string };
  delete: { path: string };
  create: { path: string };
  ready: void;
};

export type Frontmatter = {
  slug?: string;
  url?: string;
};

export type BrainDBOptions = {
  source: string;
  // TODO: maybe array?
  files?: string;
  generateUrl?: (path: string, frontmatter: Frontmatter) => string;
  // path for db
  // if there is a pass then use cache
  dbPath?: string;
  cache?: boolean;
  // TODO: pass ignore from config
};

export class BrainDB {
  private cfg: BrainDBOptions;
  private emitter: Emitter<Events>;
  private db: Db;
  private watcher: FSWatcher | undefined;
  private initializing = true;
  private initQueue: Promise<string>[] = [];

  constructor(cfg: BrainDBOptions) {
    this.cfg = { ...cfg, source: cfg.source.replace(/\/$/, "") };
    this.cfg.files = `${this.cfg.source}${this.cfg.files || "/**/*.md"}`;
    // https://nodejs.org/api/events.html#eventtarget-and-event-api
    this.emitter = mitt<Events>();
    this.db = getDb(this.cfg.dbPath || ":memory:");
  }

  start() {
    if (this.watcher) throw new Error("Already started");

    this.initializing = true;
    // this will acumulate all files, which can be problematic
    // what if instead of array - fetch files from DB in the end
    this.initQueue = [];

    this.watcher = chokidar
      .watch(this.cfg.files!, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
      })
      .on("error", (error) => console.log(`Watcher error: ${error}`))
      .on("ready", async () => {
        const res = await Promise.all(this.initQueue);
        this.initQueue = [];
        resolveLinks(this.db);
        this.initializing = false;

        res.forEach((path) => this.emitter.emit("create", { path }));
        this.emitter.emit("ready");
      })
      .on("add", async (file) => {
        let path = !file.startsWith("/") ? "/" + file : file;
        path = path.replace(this.cfg.source, "");
        if (this.initializing) {
          const p = addFile(this.db, path, this.cfg).then(() => path);
          this.initQueue.push(p);
          await p;
          return;
        }

        const linksBefore = getLinksTo(this.db, path);

        await addFile(this.db, path, this.cfg);
        this.emitter.emit("create", { path });

        resolveLinks(this.db);
        const linksAfter = getLinksTo(this.db, path);
        symmetricDifference(linksBefore, linksAfter).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      })
      .on("unlink", (file) => {
        let path = !file.startsWith("/") ? "/" + file : file;
        path = path.replace(this.cfg.source, "");

        const linksBefore = getLinksTo(this.db, path);

        deleteFile(this.db, path);
        this.emitter.emit("delete", { path });

        symmetricDifference(linksBefore, []).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      })
      .on("change", async (file) => {
        let path = !file.startsWith("/") ? "/" + file : file;
        path = path.replace(this.cfg.source, "");

        const linksBefore = getLinksTo(this.db, path);

        await addFile(this.db, path, this.cfg);
        this.emitter.emit("update", { path });

        resolveLinks(this.db);
        const linksAfter = getLinksTo(this.db, path);

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

  toDot() {
    return toDot(this.db);
  }

  /**
   * returns [Elements JSON](https://js.cytoscape.org/#notation/elements-json)
   */
  toJson() {
    return toGraphology(this.db);
  }

  // experimental

  /**
   * @deprecated
   * TODO: return string or stream instead
   * but I need to use relative paths for this?
   * getMarkdown() and destination should be optional
   */
  writeFile(
    path: string,
    destination: string,
    destinationPath?: (path: string) => string
  ) {
    return generateFile(this.db, path, destination, destinationPath);
  }

  // documents() {
  //   return this.db.select().from(document);
  // }

  // links() {
  //   return this.db.select().from(link);
  // }
}
