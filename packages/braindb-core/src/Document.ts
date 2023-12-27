import { eq } from "drizzle-orm";
import { Db } from "./db.js";
import { getMarkdown } from "./getMarkdown.js";
import { BrainDBOptionsOut } from "./index.js";
import { DocumentProps, document } from "./schema.js";
import { getLinksTo } from "./resolveLinks.js";
import { getHtml } from "./getHtml.js";

export class Document {
  private idPath: string;
  // @ts-expect-error it is lazyly initialized only on the request
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
  html() {
    return getHtml(this.db, this.getDoc());
  }
  /**
   * Like backLinks, but returns unique documents, that links to this one
   */
  backDocuments() {
    return getLinksTo(this.db, this.idPath).map(
      (from) => new Document(this.db, from)
    );
  }
  // TODO: backLinks, but I need `Link` class first
  // experimental
  title() {
    return (this.getDoc().frontmatter!["title"] as string) || this.slug();
  }
  // id() {
  //   return this.getDoc().properties["id"] as string
  // }
}
