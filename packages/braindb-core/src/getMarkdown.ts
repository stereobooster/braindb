import { map } from "unist-util-map";
import { stringify as stringifyYaml } from "yaml";
import { and, eq } from "drizzle-orm";
import { DocumentProps, document, link } from "./schema.js";
import { mdParser } from "./parser.js";
import { Db } from "./db.js";
import { BrainDBOptionsOut, Frontmatter } from "./index.js";

export function getMarkdown(
  db: Db,
  frontmatter: Frontmatter,
  d: DocumentProps,
  options: BrainDBOptionsOut = {}
): string | Uint8Array {
  const { transformPath, linkType } = options;

  let frontmatterDetected = false;
  const modified = map(d.ast as any, (node) => {
    if (node.type == "yaml") {
      frontmatterDetected = true;
      return {
        type: "yaml",
        value: stringifyYaml(frontmatter).trim(),
      };
    }
    if (node.type === "wikiLink" || node.type === "link") {
      const label =
        node.type === "link"
          ? (node.children[0].value as string)
          : node.data.alias;

      const [resolvedLink] = db
        .select()
        .from(link)
        .where(
          and(eq(link.from, d.path), eq(link.start, node.position.start.offset))
        )
        .all();

      if (!resolvedLink || !resolvedLink.to) return node;

      let url: string;

      if (linkType === "web") {
        const toDocument = db
          .select()
          .from(document)
          .where(and(eq(document.path, resolvedLink.to)))
          .get();
        if (!toDocument) return node;
        url = toDocument.url;
      } else {
        url = resolvedLink.to;
        if (transformPath) url = transformPath(url);
      }

      if (!url.startsWith("/")) url = "/" + url;

      if (resolvedLink.to_anchor)
        url = url + "#" + resolvedLink.to_anchor;
      url = encodeURI(url);

      return {
        type: "link",
        title: node.title,
        url,
        children: [
          {
            type: "text",
            value: label,
          },
        ],
      };
    }
    return node;
  });
  if (!frontmatterDetected) {
    modified.children.unshift({
      type: "yaml",
      value: stringifyYaml(frontmatter).trim(),
    });
  }

  return mdParser.stringify(modified);
}
