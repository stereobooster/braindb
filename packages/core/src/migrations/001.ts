import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("files")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("mtime", "real", (col) => col.notNull())
    .addColumn("checksum", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("cfghash", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("revision", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("type", "text")
    .addColumn("path", "text", (col) => col.notNull().unique())
    .addColumn("slug", "text", (col) => col.notNull())
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("updated_at", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("data", "text", (col) => col.notNull())
    .addColumn("ast", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("files_path")
    .on("files")
    .column("path")
    .unique()
    .execute();
  await db.schema
    .createIndex("files_slug")
    .on("files")
    .column("slug")
    .execute();
  await db.schema.createIndex("files_url").on("files").column("url").execute();
  await db.schema
    .createIndex("files_type")
    .on("files")
    .column("type")
    .execute();

  await db.schema
    .createTable("links")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("source", "text", (col) => col.notNull())
    .addColumn("target", "text")
    .addColumn("start", "integer", (col) => col.notNull())
    .addColumn("target_slug", "text")
    .addColumn("target_url", "text")
    .addColumn("target_path", "text")
    .addColumn("target_anchor", "text")
    .addColumn("line", "integer", (col) => col.notNull())
    .addColumn("column", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("links_source_start")
    .on("links")
    .columns(["source", "start"])
    .unique()
    .execute();
  await db.schema
    .createIndex("links_target_slug")
    .on("links")
    .column("target_slug")
    .execute();
  await db.schema
    .createIndex("links_target_url")
    .on("links")
    .column("target_url")
    .execute();
  await db.schema
    .createIndex("links_target_path")
    .on("links")
    .column("target_path")
    .execute();

  await db.schema
    .createTable("tasks")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("source", "text", (col) => col.notNull())
    .addColumn("start", "integer", (col) => col.notNull())
    .addColumn("ast", "text", (col) => col.notNull())
    .addColumn("checked", "integer", (col) => col.notNull())
    .addColumn("line", "integer", (col) => col.notNull())
    .addColumn("column", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("tasks_source_start")
    .on("tasks")
    .columns(["source", "start"])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("files").execute();
  await db.schema.dropTable("links").execute();
  await db.schema.dropTable("tasks").execute();
}
