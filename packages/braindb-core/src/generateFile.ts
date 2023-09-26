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
  pathToCrawl: string,
  path: string,
  destination: string,
) {
  const basePathRegexp = RegExp(`^/${pathToCrawl}`);
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
    if (node.type == "wikiLink") {
      const [resolvedLink] = db
        .select()
        .from(link)
        .where(
          and(eq(link.from, d.path), eq(link.start, node.position.start.offset))
        )
        .all();

      if (!resolvedLink || !resolvedLink.to) return node;

      // I can output relative links instead
      let url = "/" + destination + resolvedLink.to.replace(basePathRegexp, "");
      if (resolvedLink.properties.to_anchor) {
        url = url + "#" + resolvedLink.properties.to_anchor;
      }
      url = encodeURI(url);

      return {
        type: "link",
        title: null,
        url,
        children: [
          {
            type: "text",
            value: node.data.alias,
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
  const mdPath = destination + d.path.replace(basePathRegexp, "");
  mkdirp.sync(dirname(mdPath));
  writeFileSync(mdPath, mdParser.stringify(modified), { encoding: "utf8" });
}
