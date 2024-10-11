import remarkCodeHook from "@beoe/remark-code-hook";
import { BrainDB } from "@braindb/core";
// @ts-expect-error required for generated types
import type { Root } from "mdast";
// @ts-expect-error required for generated types
import type { Plugin } from "unified";

// const list = <T>(children: T[]) => ({
//   type: "list",
//   ordered: false,
//   start: null,
//   spread: false,
//   children,
// });
const listItem = <T>(children: T[], checked: boolean | null = null) => ({
  type: "listItem",
  spread: false,
  checked,
  children,
});
// const paragraph = <T>(children: T[]) => ({ type: "paragraph", children });
// const link = <T>(children: T[], url: string) => ({
//   type: "link",
//   title: null,
//   url: url,
//   children,
// });
// const text = (value: string) => ({ type: "text", value });
// const checkbox = (checked: boolean) => ({
//   type: "element",
//   tagName: "input",
//   properties: {
//     type: "checkbox",
//     checked,
//   },
// });

const serializeColumn = (name: string, value: any) => {
  switch (name) {
    case "ast":
      return JSON.parse(value)?.children || [];
    case "checked":
      return [listItem([], Boolean(value))];
    default:
      return [{ type: "text", value: String(value) }];
  }
};

const generateTable = (rows: unknown[]) => {
  if (rows.length === 0) return "empty";
  const first = rows[0];
  if (first === null || typeof first !== "object") return "wrong result";

  const columns = Object.keys(first);
  const align = columns.map(() => "left");

  return {
    type: "table",
    align,
    children: [
      {
        type: "tableRow",
        children: columns.map((value) => ({
          type: "tableCell",
          children: [{ type: "text", value }],
        })),
      },
      ...rows.map((row: any) => ({
        type: "tableRow",
        children: columns.map((name) => ({
          type: "tableCell",
          children: serializeColumn(name, row[name]),
        })),
      })),
    ],
  };
};

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
        return generateTable(bdb.__rawQuery(code));
      } catch (e) {
        return String(e);
      }

      // const grouped: Record<string, Task[]> = {};
      // bdb.tasksSync().forEach((task) => {
      //   const path = task.from().path();
      //   grouped[path] = grouped[path] || [];
      //   grouped[path].push(task);
      // });

      // return paragraph(
      //   Object.values(grouped).flatMap((group) => {
      //     const doc = group[0].from();
      //     return [
      //       paragraph([link([text(doc.title())], doc.url())]),
      //       list(group.map((task) => listItem([task.ast()], task.checked()))),
      //     ];
      //   })
      // );
    },
  });
}
