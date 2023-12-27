import { DocumentProps } from "./schema.js";
import { mdParserHtml } from "./parser.js";
import { Db } from "./db.js";
import { getMarkdown } from "./getMarkdown.js";

export function getHtml(db: Db, d: DocumentProps): string | Uint8Array {
  // TODO: need a way to convert mdast tree to hast tree to avoid douple parsing
  // https://github.com/syntax-tree/mdast-util-to-hast
  const markdown = getMarkdown(db, {}, d, {
    linkType: "web",
  });
  return mdParserHtml.process(markdown);
}
