import { map } from "unist-util-map";
import { stringify as stringifyYaml } from "yaml";
import { mkdirp } from "mkdirp";
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { and, eq } from "drizzle-orm";
import { document, link } from "./schema";
import { mdParser } from "./parser";
import { Db } from "./db";

export function generateFile(
  db: Db,
  path: string,
  destination: string,
  destinationPath?: (path: string) => string
) {
  const [d] = db.select().from(document).where(eq(document.path, path)).all();

  let frontmatterDetected = false;
  const modified = map(d.ast as any, (node) => {
    if (node.type == "yaml") {
      frontmatterDetected = true;
      return {
        type: "yaml",
        value: stringifyYaml(d.frontmatter).trim(),
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

      // I can output relative links instead
      let url = destinationPath
        ? destinationPath(resolvedLink.to)
        : resolvedLink.to;

      if (!url.startsWith("/")) url = "/" + url;
      if (resolvedLink.properties.to_anchor) {
        url = url + "#" + resolvedLink.properties.to_anchor;
      }
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
      value: stringifyYaml(d.frontmatter).trim(),
    });
  }
  const mdPath =
    destination + (destinationPath ? destinationPath(d.path) : d.path);
  mkdirp.sync(dirname(mdPath));
  writeFileSync(mdPath, mdParser.stringify(modified), { encoding: "utf8" });
}
