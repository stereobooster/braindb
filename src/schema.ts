import { text, sqliteTable, integer, unique, real } from "drizzle-orm/sqlite-core";
import { JsonObject } from "./types";

// const timestamp = customType<{
//   data: Date;
//   driverData: string;
// }>({
//   dataType() {
//     return "text";
//   },
//   fromDriver(value: string): Date {
//     return new Date(value);
//   },
// });

// TODO: better types for JSON columns https://github.com/drizzle-team/drizzle-orm/discussions/386
export const document = sqliteTable("documents", {
  path: text("path").primaryKey(),
  // content
  frontmatter: text("frontmatter", { mode: "json" })
    .$type<JsonObject>()
    .notNull(),
  ast: text("ast", { mode: "json" }).notNull(),
  markdown: text("markdown").notNull(),
  // to avoide reparse
  checksum: text("checksum").notNull(),
  // for link resolution - may add index to it
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  // properties
  properties: text("properties", { mode: "json" })
    .$type<JsonObject>()
    .notNull(),
  // file modification time https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/sys_stat.h.html
  mtime: real("mtime").notNull(),
});

export const link = sqliteTable(
  "links",
  {
    // edge for directed graph
    from: text("from").notNull(),
    to: text("to"),
    /**
     * Options to uniqlly identify link in the document
     * - **path + start.offset**
     * - autoincrement
     * - uuid-like (random)
     * - path + start.column + start.line
     */
    start: integer("start").notNull(),
    // properties
    properties: text("properties", { mode: "json" })
      .$type<JsonObject>()
      .notNull(),
    // do I need ast?
    ast: text("ast", { mode: "json" }).notNull(),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
  })
);
