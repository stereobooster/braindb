import { eq } from "drizzle-orm";
import { Db } from "./db.js";
import { getMarkdown } from "./getMarkdown.js";
import { BrainDBOptionsOut } from "./index.js";
import { DocumentProps, document } from "./schema.js";
import { getDocumentsFrom, unresolvedLinks } from "./resolveLinks.js";
import { Link } from "./Link.js";
import { toText } from "./toText.js";

export class Document {
  private idPath: string;
  // @ts-expect-error it is lazily initialized only on the request
  private doc: DocumentProps;
  private db: Db;

  private getDoc() {
    if (!this.doc) {
      const [doc] = this.db
        .select()
        .from(document)
        .where(eq(document.path, this.idPath))
        .all();
      this.doc = doc;
    }
    return this.doc;
  }

  private checkAst() {
    const ast = this.getDoc().ast as any;
    if (!ast || ast.type !== "root")
      throw new Error(
        "Do not use `storeMarkdown: false` if you want to use `markdown` and `text`"
      );
  }

  constructor(db: Db, idPath: string) {
    this.idPath = idPath;
    this.db = db;
  }

  path() {
    return this.idPath;
  }
  url() {
    return this.getDoc().url;
  }
  slug() {
    return this.getDoc().slug;
  }
  frontmatter() {
    return this.getDoc().frontmatter!;
  }
  markdown(options: BrainDBOptionsOut = {}) {
    this.checkAst();
    const { transformFrontmatter } = options;

    const frontmatter = transformFrontmatter
      ? transformFrontmatter(this)
      : this.frontmatter();

    return getMarkdown(this.db, frontmatter, this.getDoc(), options);
  }
  title() {
    return (this.getDoc().frontmatter!["title"] as string) || this.slug();
  }
  id() {
    return this.getDoc().id;
  }
  updatedAt() {
    return new Date(this.getDoc().updated_at);
  }

  /**
   * From which documents there are links to this one
   */
  documentsFrom() {
    return getDocumentsFrom({
      db: this.db,
      idPath: this.idPath,
    }).map((from) => new Document(this.db, from));
  }

  /**
   * experimental - maybe use instead outgoingLinks(to=null)
   */
  unresolvedLinks() {
    return unresolvedLinks(this.db, this.idPath).map(
      (x) => new Link(this.db, x.from, x.start)
    );
  }

  /**
   * experimental
   */
  text() {
    this.checkAst();
    return toText(this.getDoc().ast);
  }
}
