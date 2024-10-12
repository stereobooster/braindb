import { describe, expect, it } from "vitest";
import { parse, transform } from "./sqlUtils.js";

describe("parse", () => {
  it("parses select statements", () => {
    expect(parse("SELECT * FROM A")).to.toMatchInlineSnapshot(`
      {
        "columns": [
          {
            "as": null,
            "expr": {
              "column": "*",
              "table": null,
              "type": "column_ref",
            },
          },
        ],
        "distinct": null,
        "for_update": null,
        "from": [
          {
            "as": null,
            "db": null,
            "table": "A",
          },
        ],
        "groupby": null,
        "having": null,
        "limit": null,
        "options": null,
        "orderby": null,
        "type": "select",
        "where": null,
        "with": null,
      }
    `);
  });
});

describe("transform", () => {
  it("removes custom functions", () => {
    expect(() =>
      transform(
        parse(`SELECT "from", tasks.ast, length("from") - 1, checked as t, dv_md(ast) FROM tasks;`)
      )
    ).to.not.throw();
  });
});
