import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";
import { JsonObject } from "./json";

export const document = sqliteTable(
  "documents",
  {
    path: text("path").primaryKey(),
    // content
    frontmatter: text("frontmatter", { mode: "json" }).notNull(),
    ast: text("ast", { mode: "json" }).notNull(), //TODO: .$type<...>(),
    markdown: text("markdown").notNull(),
    // to avoide reparse
    checksum: text("checksum").notNull(),
    // to resolve links - may add index to it
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    // other
    properties: text("properties", { mode: "json" }).$type<JsonObject>().notNull(),
  }
);

export const link = sqliteTable(
  "links",
  {
    // edge
    from: text("from").notNull(),
    to: text("to"),
    // to uniqlly identify link in the document
    start: integer("start").notNull(),
    // properties
    properties: text("properties", { mode: "json" }).$type<JsonObject>().notNull(),
    // do I need ast?
    ast: text("ast", { mode: "json" }).notNull(),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
  })
);
