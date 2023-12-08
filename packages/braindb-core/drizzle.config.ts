import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.js",
  out: "./drizzle",
  // for `bunx drizzle-kit studio` but it doesn't work
  driver: "better-sqlite",
  dbCredentials: {
    url: "tmp/db.sqlite3",
  },
} satisfies Config;
