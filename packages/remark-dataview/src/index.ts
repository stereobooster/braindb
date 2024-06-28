import remarkCodeHook from "@beoe/remark-code-hook";
import { BrainDB, Task } from "@braindb/core";
// @ts-expect-error required for generated types
import type { Root } from "mdast";
// @ts-expect-error required for generated types
import type { Plugin } from "unified";

const list = <T>(children: T[]) => ({
  type: "list",
  ordered: false,
  start: null,
  spread: false,
  children,
});
const listItem = <T>(children: T[], checked: boolean | null = null) => ({
  type: "listItem",
  spread: false,
  checked,
  children,
});
const paragraph = <T>(children: T[]) => ({ type: "paragraph", children });
const link = <T>(children: T[], url: string) => ({
  type: "link",
  title: null,
  url: url,
  children,
});
const text = (value: string) => ({ type: "text", value });

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
      if (code !== "TASK")
        throw new Error("PoC of Daview - only TASK supported");

      const grouped: Record<string, Task[]> = {};
      bdb.tasksSync().forEach((task) => {
        const path = task.from().path();
        grouped[path] = grouped[path] || [];
        grouped[path].push(task);
      });

      return paragraph(
        Object.values(grouped).flatMap((group) => {
          const doc = group[0].from();
          return [
            paragraph([link([text(doc.title())], doc.url())]),
            list(group.map((task) => listItem([task.ast()], task.checked()))),
          ];
        })
      );
    },
  });
}
