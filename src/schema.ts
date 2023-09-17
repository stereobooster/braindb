import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";
import { JsonObject } from "./json";

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
