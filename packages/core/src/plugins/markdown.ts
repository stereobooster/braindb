import { parse as parseYaml } from "yaml";
import { JsonObject } from "../types.js";
import { visit, SKIP, EXIT } from "unist-util-visit";
import { mdParser } from "../parser.js";
import type { Node } from "unist";
import { dirname, resolve } from "node:path";
import { link, task } from "../schema.js";
import { isExternalLink } from "../utils.js";
import { Db } from "../db.js";
import path from "node:path";
import { BasePlugin, InsertCb } from "./base.js";

export class MarkdownPlugin implements BasePlugin {
  process(db: Db, idPath: string, content: Buffer, insert: InsertCb) {
    const ast = mdParser.parse(content.toString("utf8"));
    const data = getFrontmatter(ast);
    const { name } = path.parse(idPath);
    if (!data.title) data.title = name;

    const newFile = insert(data, ast, "markdown");

    visit(ast as any, (node) => {
      if (node.type === "link" || node.type === "wikiLink") {
        if (node.type === "link") {
          if (isExternalLink(node.url)) {
            /**
             * not interested in external links for now
             * in future may be used:
             * - to check if it returns <= 400
             * - to fetch icon
             * - to generate screenshot
             */
            return SKIP;
          }
        }

        let target_url, target_path, target_slug, target_anchor;

        if (node.type === "link") {
          // label = node.children[0]?.value as string;
          [target_url, target_anchor] = decodeURI(node.url).split("#");
          target_path = target_url;
          // resolve local link
          if (!target_url.startsWith("/")) {
            target_url = resolve(newFile.url, target_url);
          }
          // normalize url
          if (!target_url.endsWith("/")) {
            target_url = target_url + "/";
          }
          // resolve local path
          if (!target_path.startsWith("/")) {
            target_path = resolve(dirname(idPath), target_path);
          }
        } else {
          // label = node.data.alias as string;
          [target_slug, target_anchor] = node.value.split("#");
        }

        const start = node.position.start.offset as number;
        const line = node.position.start.line as number;
        const column = node.position.start.column as number;

        db.insert(link)
          .values({
            source: idPath,
            start,
            target_url,
            target_path,
            target_slug,
            target_anchor,
            line,
            column,
          })
          .run();

        return SKIP;
      }

      if (
        node.type === "listItem" &&
        (node.checked === true || node.checked === false)
      ) {
        const start = node.position.start.offset as number;
        const line = node.position.start.line as number;
        const column = node.position.start.column as number;
        const checked = node.checked;
        const ast = node.children[0];

        db.insert(task)
          .values({
            source: idPath,
            start,
            line,
            column,
            checked,
            ast,
          })
          .run();

        return SKIP;
      }

      // if (node.type === "heading") {
      //   return SKIP;
      // }
    });
  }

  render(_path: string): string {
    throw new Error("Not impelemented");
  }
}

export function getFrontmatter(ast: Node) {
  let frontmatter: JsonObject = {};
  // What about ast.data.matter?
  // https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
  visit(ast as any, (node) => {
    if (node.type === "yaml") {
      /**
       * can yaml handle none-JSON types? if yes, than this is a bug
       */
      frontmatter = parseYaml(node.value);
      return EXIT;
    }
  });
  return frontmatter;
}
