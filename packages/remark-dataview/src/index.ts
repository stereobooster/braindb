import remarkCodeHook from "@beoe/remark-code-hook";
import { BrainDB } from "@braindb/core";
// @ts-expect-error required for generated types
import type { Root } from "mdast";
// @ts-expect-error required for generated types
import type { Plugin } from "unified";
import { generateTable, parse, transform } from "./sqlUtils.js";

type RemarkDataviewOptions = {
  bdb: BrainDB;
};

export function remarkDataview(options: RemarkDataviewOptions) {
  const { bdb, ...rest } = options;
  // @ts-expect-error
  return remarkCodeHook.call(this, {
    ...rest,
    language: "dataview",
    code: ({ code }) => {
      try {
        const { query, columns } = transform(parse(code));
        // TODO: handle *
        return generateTable(columns, bdb.__rawQuery(query));
      } catch (e) {
        return String(e);
      }
    },
  });
}
