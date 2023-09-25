import { resolve } from "node:path";

import { Config } from "./src/config";

export default {
  source: resolve("../../example"),
  destination: resolve("../../tmp"),
  cache: false,
} satisfies Config;
