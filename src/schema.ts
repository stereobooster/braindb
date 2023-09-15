import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";

export const document = sqliteTable(
  "documents",
  {
    id: text("id").primaryKey(),
    path: text("path").notNull(),
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    checksum: text("checksum").notNull(),
    frontmatter: text("frontmatter", { mode: "json" }).notNull(),
    ast: text("ast", { mode: "json" }).notNull(), //TODO: .$type<...>(),
    markdown: text("markdown").notNull(),
  },
  (t) => ({
    path: unique("path").on(t.path),
  })
);

export const link = sqliteTable(
  "links",
  {
    from_id: text("from_id").notNull(),
    from: text("from").notNull(), 
    start: integer("start").notNull(),
    to_id: text("to_id"),
    to: text("to"),
    ast: text("ast", { mode: "json" }).notNull(),
    label: text("label").notNull(),
  },
  (t) => ({
    from_start: unique("from_start").on(t.from, t.start),
  })
);
