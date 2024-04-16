import { and, eq } from "drizzle-orm";
import { Db } from "./db.js";
import { TaskProps, task } from "./schema.js";
import { Document } from "./Document.js";
import { toText } from "./toText.js";
import { mdParser } from "./parser.js";
import { Root } from "mdast";

export class Task {
  private idPath: string;
  private offset: number;
  // @ts-expect-error it is lazyly initialized only on the request
  private lnk: TaskProps;
  private db: Db;

  private getDbRecord() {
    if (!this.lnk) {
      const [lnk] = this.db
        .select()
        .from(task)
        .where(and(eq(task.from, this.idPath), eq(task.start, this.offset)))
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
    return new Document(this.db, this.getDbRecord().from);
  }

  ast() {
    return this.getDbRecord().ast;
  }

  checked() {
    return this.getDbRecord().checked;
  }

  line() {
    return this.getDbRecord().line;
  }

  column() {
    return this.getDbRecord().column;
  }

  id() {
    return this.getDbRecord().id;
  }

  /**
   * experimental
   */
  text() {
    return toText(this.getDbRecord().ast);
  }

  markdown() {
    // to support links/wikilinks need to use `getMarkdown`
    return mdParser.stringify(this.getDbRecord().ast as Root);
  }
}
