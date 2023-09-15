import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  // maybe use id instead of path?
  path: text("path").primaryKey(),
  slug: text("slug").notNull(),
  url: text("url").notNull(),
  checksum: text("checksum").notNull(),
  frontmatter: text("frontmatter", { mode: "json" }).notNull(),
  ast: text("ast", { mode: "json" }).notNull(), //TODO: .$type<{ foo: string }>(),
  markdown: text("markdown").notNull(),
});

export type Document = typeof documents.$inferSelect;

export const links = sqliteTable(
  "links",
  {
    from: text("from").notNull(),
    start: integer("start").notNull(),
    to: text("to"),
    ast: text("ast", { mode: "json" }).notNull(),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
  })
);

export type Link = typeof links.$inferSelect;
