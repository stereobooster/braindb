import { eq, isNull } from "drizzle-orm";
import { Db } from "./db.js";
import { getMarkdown } from "./getMarkdown.js";
import { BrainDBOptionsOut } from "./index.js";
import { DocumentProps, document, link } from "./schema.js";
import { getDocumentsFrom, unresolvedLinks } from "./resolveLinks.js";
import { getHtml } from "./getHtml.js";
import { Link } from "./Link.js";

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
    const { transformFrontmatter } = options;

    const frontmatter = transformFrontmatter
      ? transformFrontmatter(this)
      : this.frontmatter();

    return getMarkdown(this.db, frontmatter, this.getDoc(), options);
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
  // TODO: backLinks, but I need `Link` class first
  title() {
    return (this.getDoc().frontmatter!["title"] as string) || this.slug();
  }
  /**
   * experimental - maybe use instead outgoingLinks(to=null)
   */
  unresolvedLinks() {
    return unresolvedLinks(this.db, this.idPath).map(
      (x) => new Link(this.db, x.from, x.start)
    );
  }
  // id() {
  //   return this.getDoc().properties["id"] as string
  // }
  /**
   * experimental
   */
  html() {
    return getHtml(this.db, this.getDoc());
  }

}
