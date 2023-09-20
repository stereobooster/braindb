import { map } from "unist-util-map";
import { document, link } from "./schema";
import { stringify as stringifyYaml } from "yaml";
import { mkdirp } from "mkdirp";
import { writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { mdParser } from "./parser";
import { and, eq } from "drizzle-orm";
import { Db } from "./db";

export function generateFile(
  db: Db,
  destination: string,
  pathToCrawl: string,
  path: string
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

      if (!resolvedLink) {
        // TODO: handle not resolved links
        return node;
      }

      let url = "";
      if (resolvedLink.to) {
        url = resolvedLink.to;
        if (url.startsWith("/")) {
          url = "/" + destination + url;
        }
        if (resolvedLink.properties.to_anchor) {
          url = url + "#" + resolvedLink.properties.to_anchor;
        }
        url = encodeURI(url);
      }

      const newNode = {
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
      return newNode;
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
  //   const mdUrl = new URL(mdPath);
  mkdirp.sync(dirname(mdPath));
  writeFileSync(mdPath, mdParser.stringify(modified), { encoding: "utf8" });
}
