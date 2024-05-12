import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import remarkStringify from "remark-stringify";

import wikiLinkPlugin, { type RemarkWikiLinkOptions } from "../src";
import { select } from "unist-util-select";

import { type WikiLinkNode } from "@braindb/mdast-util-wiki-link";

function assertWikiLink(obj: any): asserts obj is WikiLinkNode {
  if (!obj.data || !("alias" in obj.data) || !("permalink" in obj.data)) {
    throw new Error("Not a wiki link");
  }
}

describe("remark-wiki-link", () => {
  it("parses a wiki link", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin);

    let ast = processor.runSync(processor.parse("[[Wiki Link]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.permalink).toEqual(undefined);
      expect(node.data.hName).toEqual("a");
      expect(node.data.hProperties.href).toEqual("Wiki Link");
      expect(node.data.hChildren[0].value).toEqual("Wiki Link");
    });
  });

  it("handles wiki links with aliases", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin);

    let ast = processor.runSync(processor.parse("[[Real Page:Page Alias]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.permalink).toEqual(undefined);
      expect(node.data.hName).toEqual("a");
      expect(node.data.alias).toEqual("Page Alias");
      expect(node.value).toEqual("Real Page");
      expect(node.data.hProperties.href).toEqual("Real Page");
      expect(node.data.hChildren[0].value).toEqual("Page Alias");
    });
  });

  it("handles wiki alias links with custom divider", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
      aliasDivider: "|",
    });

    let ast = processor.runSync(processor.parse("[[Real Page|Page Alias]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.permalink).toEqual(undefined);
      expect(node.data.hName).toEqual("a");
      expect(node.data.alias).toEqual("Page Alias");
      expect(node.value).toEqual("Real Page");
      expect(node.data.hProperties.href).toEqual("Real Page");
      expect(node.data.hChildren[0].value).toEqual("Page Alias");
    });
  });

  it("stringifies wiki links", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(wikiLinkPlugin);

    const stringified = processor
      .processSync("[[Wiki Link]]")
      .value.toString()
      .trim();
    expect(stringified).toEqual("[[Wiki Link]]");
  });

  it("stringifies aliased wiki links", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(wikiLinkPlugin);

    const stringified = processor
      .processSync("[[Real Page:Page Alias]]")
      .value.toString()
      .trim();
    expect(stringified).toEqual("[[Real Page:Page Alias]]");
  });

  describe("configuration options", () => {
    it("uses linkResolver", () => {
      const opts: RemarkWikiLinkOptions = {
        linkResolver: (x: string) => x.toLowerCase().replace(" ", "_"),
      };

      const processor = unified().use(remarkParse).use(wikiLinkPlugin, opts);

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.permalink).toEqual("a_page");
        expect(node.data.hProperties.href).toEqual("a_page");
      });
    });

    it("uses linkTemplate", () => {
      const opts: RemarkWikiLinkOptions = {
        linkTemplate: ({ slug, permalink, alias }) => ({
          hName: "span",
          hProperties: { "data-href": permalink || slug },
          hChildren: [{ type: "text", value: alias || slug }],
        }),
      };
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, opts);

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.hName).toEqual("span");
        expect(node.data.hProperties["data-href"]).toEqual("A Page");
        expect(node.data.hChildren[0].value).toEqual("A Page");
      });
    });
  });

  describe("open wiki links", () => {
    it("handles open wiki links", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin);

      let ast = processor.runSync(processor.parse("t[[\nt"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links at end of file", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin);

      let ast = processor.runSync(processor.parse("t [["));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial data", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin);

      let ast = processor.runSync(processor.parse("t [[tt\nt"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial alias divider", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        aliasDivider: "::",
      });

      let ast = processor.runSync(processor.parse("[[t::\n"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial alias", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin);

      let ast = processor.runSync(processor.parse("[[t:\n"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });
  });
});
