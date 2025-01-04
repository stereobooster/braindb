import {
  text,
  sqliteTable,
  integer,
  unique,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { JsonObject } from "./types.js";
import { relations } from "drizzle-orm";

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

export const files = sqliteTable(
  "files",
  {
    // -- private fileds --
    // can use Inode number here
    id: integer("id").primaryKey({ autoIncrement: true }),
    // to avoid reparse
    // file modification time https://man7.org/linux/man-pages/man3/stat.3type.html
    mtime: real("mtime").notNull(),
    // file hash
    checksum: integer("checksum").default(0).notNull(),
    // config hash
    cfghash: integer("cfghash").default(0).notNull(),
    revision: integer("revision").default(0).notNull(),
    // maybe enum?
    type: text("type"),
    // -- public fileds --
    path: text("path").notNull(),
    // for link resolution
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    updated_at: integer("updated_at").default(0).notNull(),
    // content
    data: text("data", { mode: "json" }).$type<JsonObject>().notNull(),
    ast: text("ast", { mode: "json" }).notNull(),
  },
  (t) => ({
    path: unique("files_path").on(t.path),
    slug: index("files_slug").on(t.slug),
    url: index("files_url").on(t.url),
    type: index("files_type").on(t.type),
  })
);

export type FileProps = typeof files.$inferSelect;

// TODO: better types for JSON columns https://github.com/drizzle-team/drizzle-orm/discussions/386
// export const document = sqliteView("documents").as((qb) =>
//   qb.select().from(file).where(eq(file.type, "markdown"))
// );

// InferSelectModel doesn't work for views
// export type DocumentProps = typeof file.$inferSelect;

export const links = sqliteTable(
  "links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // edge for directed graph
    source: text("source").notNull(),
    target: text("target"),
    /**
     * Options to uniqlly identify link in the file
     * - **path + start.offset**
     * - autoincrement
     * - uuid-like (random)
     * - path + start.column + start.line
     */
    start: integer("start").notNull(),
    target_slug: text("target_slug"),
    target_url: text("target_url"),
    target_path: text("target_path"),
    target_anchor: text("target_anchor"),
    line: integer("line").notNull(),
    column: integer("column").notNull(),
  },
  (t) => ({
    source_start: unique("links_source_start").on(t.source, t.start),
    target_slug: index("links_target_slug").on(t.target_slug),
    target_url: index("links_target_url").on(t.target_url),
    target_path: index("links_target_path").on(t.target_path),
  })
);

export type LinkProps = typeof links.$inferSelect;

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    source: text("source").notNull(),
    /**
     * Options to uniqlly identify link in the file
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
    source_start: unique("tasks_source_start").on(t.source, t.start),
  })
);

export type TaskProps = typeof tasks.$inferSelect;

export const filesRelations = relations(links, ({ one }) => ({
  source: one(files, { fields: [links.source], references: [files.path] }),
  target: one(files, { fields: [links.target], references: [files.path] }),
}));
