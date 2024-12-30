import {
  text,
  sqliteTable,
  integer,
  unique,
  real,
  index,
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
    // to avoide reparse
    // file modification time https://man7.org/linux/man-pages/man3/stat.3type.html
    mtime: real("mtime").notNull(),
    // file hash
    checksum: text("checksum").notNull(),
    cfghash: integer("cfghash").default(0).notNull(),
    // for link resolution
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    updated_at: integer("updated_at").default(0).notNull(),
    revision: integer("revision").default(0).notNull(),
  },
  (t) => ({
    path: unique("documents_path").on(t.path),
    slug: index("documents_slug").on(t.slug),
    url: index("documents_url").on(t.url),
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
    from_start: unique("links_from_start").on(t.from, t.start),
    to_slug: index("links_to_slug").on(t.to_slug),
    to_url: index("links_to_url").on(t.to_url),
    to_path: index("links_to_path").on(t.to_path),
  })
);

export type LinkProps = typeof link.$inferSelect;

export const task = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    from: text("from").notNull(),
    /**
     * Options to uniqlly identify link in the document
     * - **path + start.offset**
     * - autoincrement
     * - uuid-like (random)
     * - path + start.column + start.line
     */
    start: integer("start").notNull(),
    ast: text("ast", { mode: "json" }).notNull(),
    checked: integer("checked", { mode: "boolean" }).notNull(),
    line: integer("line").notNull(),
    column: integer("column").notNull(),
  },
  (t) => ({
    from_start: unique("tasks_from_start").on(t.from, t.start),
  })
);

export type TaskProps = typeof task.$inferSelect;
