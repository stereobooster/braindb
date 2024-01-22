import { and, eq } from "drizzle-orm";
import { Db } from "./db.js";
import { LinkProps, link } from "./schema.js";
import { Document } from "./Document.js";

export class Link {
  private idPath: string;
  private offset: number;
  // @ts-expect-error it is lazyly initialized only on the request
  private lnk: LinkProps;
  private db: Db;

  private getLnk() {
    if (!this.lnk) {
      const [lnk] = this.db
        .select()
        .from(link)
        .where(and(eq(link.from, this.idPath), eq(link.start, this.offset)))
        .all();
      this.lnk = lnk;
    }
    return this.lnk;
  }

  constructor(db: Db, idPath: string, offset: number) {
    this.idPath = idPath;
    this.offset = offset;
    this.db = db;
  }

  from() {
    return new Document(this.db, this.getLnk().from);
  }

  to() {
    const to = this.getLnk().to;
    return to == null ? null : new Document(this.db, to);
  }

  anchor() {
    return this.getLnk().to_anchor;
  }

  line() {
    return this.getLnk().line;
  }

  column() {
    return this.getLnk().column;
  }

  label() {
    return this.getLnk().label;
  }

  id() {
    return this.getLnk().id;
  }
}
