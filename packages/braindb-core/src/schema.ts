import {
  text,
  sqliteTable,
  integer,
  unique,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { JsonObject } from "./types.js";

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
export const document = sqliteTable(
  "documents",
  {
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
  },
  (t) => ({
    // path: index("path").on(t.path),
    slug: index("slug").on(t.slug),
    url: index("url").on(t.url),
  })
);

export type DocumentProps = typeof document.$inferSelect;

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
    // ast: text("ast", { mode: "json" }).notNull(),
    from_id: text("from_id").notNull(),
    to_id: text("to_id"),
    to_slug: text("to_slug"),
    to_url: text("to_url"),
    to_path: text("to_path"),
    to_anchor: text("to_anchor"),
    label: text("label"),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
    to_slug: index("to_slug").on(t.to_slug),
    to_url: index("to_url").on(t.to_url),
    to_path: index("to_path").on(t.to_path),
  })
);
