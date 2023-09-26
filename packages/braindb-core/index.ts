import mitt, { Emitter, Handler, WildcardHandler } from "mitt";
import chokidar, { FSWatcher } from "chokidar";

import { Db, getDb } from "./src/db";
import { getLinksTo, resolveLinks } from "./src/resolveLinks";
import { addFile } from "./src/addFile";
import { symmetricDifference } from "./src/utils";
import { deleteFile } from "./src/deleteFile";
import { generateFile } from "./src/generateFile";
import { toDot } from "./src/graphVisualization";

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
  generateUrl?: (path: string, frontmatter: Frontmatter) => string;
  cache?: boolean;
  // path for db
  // TODO: pass ignore from config
};

// https://nodejs.org/api/events.html#eventtarget-and-event-api
export class BrainDB {
  private cfg: BrainDBOptions;
  private emitter: Emitter<Events>;
  private db: Db;
  private watcher: FSWatcher | undefined;
  private initializing = true;
  private initQueue: Promise<string>[] = [];

  constructor(cfg: BrainDBOptions) {
    this.cfg = cfg;
    this.emitter = mitt<Events>();
    this.db = getDb(":memory:");
  }

  start() {
    if (this.watcher) throw new Error("Already started");

    this.initializing = true;
    this.initQueue = [];

    this.watcher = chokidar
      .watch(`${this.cfg.source}/**/*.md`, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
      })
      .on("ready", async () => {
        const res = await Promise.all(this.initQueue);
        this.initQueue = [];
        resolveLinks(this.db);
        this.initializing = false;

        res.forEach((path) => this.emitter.emit("create", { path }));
        this.emitter.emit("ready");
      })
      .on("add", async (file) => {
        const path = "/" + file;
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
        const path = "/" + file;
        const linksBefore = getLinksTo(this.db, path);

        deleteFile(this.db, path);
        this.emitter.emit("delete", { path });

        symmetricDifference(linksBefore, []).forEach((path) =>
          this.emitter.emit("update", { path })
        );
      })
      .on("change", async (file) => {
        const path = "/" + file;
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

  writeFile(path: string, destination: string) {
    return generateFile(this.db, this.cfg.source, path, destination);
  }

  toDot() {
    return toDot(this.db)
  }
}
