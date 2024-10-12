import nodeSql from "node-sql-parser";
const parser = new nodeSql.Parser();
const opt = { database: "Sqlite" };
// https://sqlite.org/lang_corefunc.html

import {
  BlockContent,
  DefinitionContent,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Text,
} from "mdast";

export function parse(query: string) {
  const ast = parser.astify(query, opt);
  if (Array.isArray(ast) && ast.length != 1)
    throw new Error("Use only one select statement");
  const statement = Array.isArray(ast) ? ast[0] : ast;
  if (statement.type !== "select")
    throw new Error("Use only one select statement");

  return statement;
}

// https://github.com/taozhi8833998/node-sql-parser/blob/master/src/column.js
function columnName(col: nodeSql.Column) {
  if (col.as) {
    if (typeof col.as === "string") return col.as;
    else return parser.exprToSQL(col.as, opt);
  }

  return columnNameExpr(col.expr);
}

function columnNameExpr(expr: nodeSql.ExpressionValue): string {
  // @ts-ignore
  if (expr.type === "column_ref") return expr.column;

  return parser.exprToSQL(expr, opt);
}

type Column =
  | {
      dv: false;
      name: string;
    }
  | { dv: true; name: string; func: string; args: string[] };

export function transform(query: nodeSql.Select) {
  const columns: Column[] = [];
  const newQueryColumns: nodeSql.Column[] = [];

  query.columns.forEach((col: nodeSql.Column) => {
    if (col.expr.type == "function") {
      const func: nodeSql.Function = col.expr as any;
      if (
        func.name.name[0].type === "default" &&
        func.name.name[0].value === "dv_ast"
      ) {
        if (
          func.args?.type === "expr_list" &&
          Array.isArray(func.args?.value) &&
          func.args?.value.length === 1
        ) {
          columns.push({
            dv: true,
            name: columnName(col),
            func: func.name.name[0].value,
            args: func.args.value.map((arg) => columnNameExpr(arg)),
          });
          newQueryColumns.push({ as: null, expr: func.args?.value[0] });
          return;
        } else {
          throw new Error("dv_ast requires exactly one param");
        }
      }

      if (
        func.name.name[0].type === "default" &&
        func.name.name[0].value === "dv_link"
      ) {
        if (
          func.args?.type === "expr_list" &&
          Array.isArray(func.args?.value) &&
          func.args?.value.length === 2
        ) {
          columns.push({
            dv: true,
            name: columnName(col),
            func: func.name.name[0].value,
            args: func.args.value.map((arg) => columnNameExpr(arg)),
          });
          newQueryColumns.push({ as: null, expr: func.args?.value[0] });
          newQueryColumns.push({ as: null, expr: func.args?.value[1] });
          return;
        } else {
          throw new Error("dv_link requires exactly two params");
        }
      }
    }
    columns.push({ dv: false, name: columnName(col) });
    newQueryColumns.push(col);
  });

  return {
    query: parser.sqlify({ ...query, columns: newQueryColumns }, opt),
    columns,
  };
}

const text = (value: string): Text => ({ type: "text", value });

const paragraph = (children: PhrasingContent[]): Paragraph => ({
  type: "paragraph",
  children,
});

const link = (url: string, children: PhrasingContent[]): Link => ({
  type: "link",
  title: null,
  url: url,
  children,
});

const list = (children: ListItem[]): List => ({
  type: "list",
  ordered: false,
  start: null,
  spread: false,
  children,
});

const listItem = (
  children: Array<BlockContent | DefinitionContent>,
  checked: boolean | null = null
): ListItem => ({
  type: "listItem",
  spread: false,
  checked,
  children,
});

const root = (children: RootContent[]): Root => ({
  type: "root",
  children,
});

const columnToMdast = (column: Column, row: any) => {
  if (column.dv === false) return [text(String(row[column.name]))];

  switch (column.func) {
    case "dv_ast":
      return JSON.parse(row[column.args[0]])?.children || [];
    case "dv_link":
      return [link(row[column.args[0]], [text(row[column.args[1]])])];
    default:
      throw new Error(`Unknown function ${column.name}`);
  }
};

export const generateTable = (columns: Column[], rows: unknown[]) => {
  if (rows.length === 0) return "empty";
  const first = rows[0];
  if (first === null || typeof first !== "object") return "wrong result";

  const align = columns.map(() => "left");

  return {
    type: "table",
    align,
    children: [
      {
        type: "tableRow",
        children: columns.map((value) => ({
          type: "tableCell",
          children: [text(value.name)],
        })),
      },
      ...rows.map((row: any) => ({
        type: "tableRow",
        children: columns.map((column) => ({
          type: "tableCell",
          children: columnToMdast(column, row),
        })),
      })),
    ],
  };
};

export const generateList = (columns: Column[], rows: any[]) => {
  if (columns.length === 1)
    return list(rows.map((row) => listItem(columnToMdast(columns[0], row))));

  if (columns.length === 2) {
    const grouped: Record<string, any> = {};
    rows.forEach((row) => {
      const first = row[columns[0].name] as string;
      grouped[first] = grouped[first] || [];
      grouped[first].push(row);
    });

    return root(
      Object.values(grouped).flatMap((group) => {
        const first = columnToMdast(columns[0], group[0]);
        return [
          paragraph(first),
          list(
            group.map((row: any) => listItem(columnToMdast(columns[1], row)))
          ),
        ];
      })
    );
  }

  throw new Error("List expects 1 or 2 columns");
};
