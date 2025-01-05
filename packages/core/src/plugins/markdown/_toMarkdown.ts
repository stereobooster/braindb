// import { map } from "unist-util-map";
// import { stringify as stringifyYaml } from "yaml";
// import { and, eq } from "drizzle-orm";
// import { FileProps, files, links } from "../../schema_drizzle.js";
// import { mdParser } from "../../parser.js";
// import { BrainDBOptionsOut, Frontmatter } from "../../index.js";
// import { isExternalLink } from "../../utils.js";
// import { AllDb } from "../../db.js";

// export function toMarkdown(
//   db: AllDb,
//   frontmatter: Frontmatter,
//   d: FileProps,
//   options: BrainDBOptionsOut = {}
// ): string | Uint8Array {
//   const { transformPath, linkType, transformUnresolvedLink } = options;

//   let frontmatterDetected = false;
//   const modified = map(d.ast as any, (node) => {
//     if (node.type == "yaml") {
//       frontmatterDetected = true;
//       return {
//         type: "yaml",
//         value: stringifyYaml(frontmatter).trim(),
//       };
//     }
//     if (node.type === "wikiLink" || node.type === "link") {
//       const label =
//         node.type === "link"
//           ? (node.children[0].value as string)
//           : node.data.alias;

//       if (isExternalLink(node.url)) return node;

//       const [resolvedLink] = db.drizzle
//         .select()
//         .from(links)
//         .where(
//           and(
//             eq(links.source, d.path),
//             eq(links.start, node.position.start.offset)
//           )
//         )
//         .all();

//       if (!resolvedLink || !resolvedLink.target)
//         return (
//           (transformUnresolvedLink && transformUnresolvedLink(d.path, node)) ||
//           node
//         );

//       let url: string;

//       if (linkType === "web") {
//         const toFile = db.drizzle
//           .select()
//           .from(files)
//           .where(and(eq(files.path, resolvedLink.target)))
//           .get();
//         if (!toFile) return node;
//         url = toFile.url;
//       } else {
//         url = resolvedLink.target;
//         if (transformPath) url = transformPath(url);
//       }

//       if (!url.startsWith("/")) url = "/" + url;

//       if (resolvedLink.target_anchor)
//         url = url + "#" + resolvedLink.target_anchor;
//       url = encodeURI(url);

//       return {
//         type: "link",
//         title: node.title,
//         url,
//         children: [
//           {
//             type: "text",
//             value: label,
//           },
//         ],
//       };
//     }
//     return node;
//   });
//   if (!frontmatterDetected) {
//     modified.children.unshift({
//       type: "yaml",
//       value: stringifyYaml(frontmatter).trim(),
//     });
//   }

//   return mdParser.stringify(modified);
// }
