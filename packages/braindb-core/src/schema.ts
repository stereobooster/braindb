import {
  text,
  sqliteTable,
  integer,
  unique,
  real,
  index,
  int,
} from "drizzle-orm/sqlite-core";
import { JsonObject } from "./types.js";

// int("updated_at", { mode: "timestamp" }),
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
    // can use Inode number here
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path").notNull(),
    // content
    frontmatter: text("frontmatter", { mode: "json" })
      .$type<JsonObject>()
      .notNull(),
    ast: text("ast", { mode: "json" }).notNull(),
    markdown: text("markdown").notNull(),
    // to avoide reparse
    // file modification time https://man7.org/linux/man-pages/man3/stat.3type.html
    mtime: real("mtime").notNull(),
    checksum: text("checksum").notNull(),
    // for link resolution
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    // title: text("title"),
    updated_at: int("updated_at").default(0).notNull(),
  },
  (t) => ({
    path: unique("path").on(t.path),
    slug: index("slug").on(t.slug),
    url: index("url").on(t.url),
  })
);

export type DocumentProps = typeof document.$inferSelect;

export const link = sqliteTable(
  "links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    to_slug: text("to_slug"),
    to_url: text("to_url"),
    to_path: text("to_path"),
    to_anchor: text("to_anchor"),
    label: text("label"),
    line: integer("line").notNull(),
    column: integer("column").notNull(),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
    to_slug: index("to_slug").on(t.to_slug),
    to_url: index("to_url").on(t.to_url),
    to_path: index("to_path").on(t.to_path),
  })
);

export type LinkProps = typeof link.$inferSelect;
