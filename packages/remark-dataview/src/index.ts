import remarkCodeHook from "@beoe/remark-code-hook";
import { BrainDB } from "@braindb/core";
// @ts-expect-error required for generated types
import type { Root } from "mdast";
// @ts-expect-error required for generated types
import type { Plugin } from "unified";
import {
  generateList,
  generateTable,
  parse,
  processMeta,
  transform,
} from "./sqlUtils.js";

type RemarkDataviewOptions = {
  getBrainDb: () => BrainDB;
  /**
   * @deprecated
   */
  bdb?: BrainDB;
};

export function remarkDataview(options: RemarkDataviewOptions) {
  const { getBrainDb, bdb, ...rest } = options;
  // @ts-expect-error
  return remarkCodeHook.call(this, {
    ...rest,
    language: "dataview",
    code: async ({ code, meta }) => {
      if (getBrainDb == null) {
        console.warn(
          `[remark-dataview]: "bdb" option is deprecated. Use "getBrainDb" instead`
        );
      }
      const bdbInstance = getBrainDb == null ? bdb! : getBrainDb();
      await bdbInstance.ready();

      try {
        const options = processMeta(meta);
        const { query, columns } = transform(parse(code));
        if (options.list)
          return generateList(columns, bdbInstance.__rawQuery(query), options);

        return generateTable(columns, bdbInstance.__rawQuery(query));
      } catch (e) {
        return String(e);
      }
    },
  });
}

export default remarkDataview;
