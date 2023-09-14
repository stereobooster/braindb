import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  // maybe use id instead of path?
  path: text("path").primaryKey(),
  url: text("url"),
  checksum: text("checksum"),
  frontmatter: text("frontmatter", { mode: "json" }).notNull(),
  ast: text("ast", { mode: "json" }),
  markdown: text("markdown").notNull(),
});

export type Document = typeof documents.$inferSelect;

export const links = sqliteTable("links", {
  from: text("path").notNull(),
  to: text("to"),
  // @ts-ignore
  ast: text("ast", { mode: "json" }),
});

export type Link = typeof links.$inferSelect;
