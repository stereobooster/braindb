import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  // for `bunx drizzle-kit studio` but it doesn't work
  // driver: "better-sqlite",
  dbCredentials: {
    url: "tmp/db.sqlite3",
  },
} satisfies Config;
