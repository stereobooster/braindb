import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import remarkStringify from "remark-stringify";

import wikiLinkPlugin from "../src";
import { select } from "unist-util-select";

import { type WikiLinkNode } from "@braindb/mdast-util-wiki-link";

function assertWikiLink(obj: any): asserts obj is WikiLinkNode {
  if (
    !obj.data ||
    obj.data.exists === undefined ||
    obj.data.permalink === undefined
  ) {
    throw new Error("Not a wiki link");
  }
}

describe("remark-wiki-link", () => {
  it("parses a wiki link that has a matching permalink", () => {
    const processor = unified()
      .use(remarkParse)
      .use(wikiLinkPlugin, {
        permalinks: ["wiki_link"],
      });

    let ast = processor.runSync(processor.parse("[[Wiki Link]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.exists).toEqual(true);
      expect(node.data.permalink).toEqual("wiki_link");
      expect(node.data.hName).toEqual("a");
      expect(node.data.hProperties.className).toEqual("internal");
      expect(node.data.hProperties.href).toEqual("#/page/wiki_link");
      expect(node.data.hChildren[0].value).toEqual("Wiki Link");
    });
  });

  it("parses a wiki link that has no matching permalink", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
      permalinks: [],
    });

    let ast = processor.runSync(processor.parse("[[New Page]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.exists).toEqual(false);
      expect(node.data.permalink).toEqual("new_page");
      expect(node.data.hName).toEqual("a");
      expect(node.data.hProperties.className).toEqual("internal new");
      expect(node.data.hProperties.href).toEqual("#/page/new_page");
      expect(node.data.hChildren[0].value).toEqual("New Page");
    });
  });

  it("handles wiki links with aliases", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
      permalinks: [],
    });

    let ast = processor.runSync(processor.parse("[[Real Page:Page Alias]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.exists).toEqual(false);
      expect(node.data.permalink).toEqual("real_page");
      expect(node.data.hName).toEqual("a");
      expect(node.data.alias).toEqual("Page Alias");
      expect(node.value).toEqual("Real Page");
      expect(node.data.hProperties.className).toEqual("internal new");
      expect(node.data.hProperties.href).toEqual("#/page/real_page");
      expect(node.data.hChildren[0].value).toEqual("Page Alias");
    });
  });

  it("handles wiki alias links with custom divider", () => {
    const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
      permalinks: [],
      aliasDivider: "|",
    });

    let ast = processor.runSync(processor.parse("[[Real Page|Page Alias]]"));

    visit(ast, "wikiLink", (node: WikiLinkNode) => {
      assertWikiLink(node);

      expect(node.data.exists).toEqual(false);
      expect(node.data.permalink).toEqual("real_page");
      expect(node.data.hName).toEqual("a");
      expect(node.data.alias).toEqual("Page Alias");
      expect(node.value).toEqual("Real Page");
      expect(node.data.hProperties.className).toEqual("internal new");
      expect(node.data.hProperties.href).toEqual("#/page/real_page");
      expect(node.data.hChildren[0].value).toEqual("Page Alias");
    });
  });

  it("stringifies wiki links", () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(wikiLinkPlugin, { permalinks: ["wiki_link"] });

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
    it("uses pageResolver", () => {
      const identity = (name: string) => [name];

      const processor = unified()
        .use(remarkParse)
        .use(wikiLinkPlugin, {
          pageResolver: identity,
          permalinks: ["A Page"],
        });

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.exists).toEqual(true);
        expect(node.data.permalink).toEqual("A Page");
        expect(node.data.hProperties.href).toEqual("#/page/A Page");
      });
    });

    it("uses newClassName", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        newClassName: "new_page",
      });

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.hProperties.className).toEqual("internal new_page");
      });
    });

    it("uses hrefTemplate", () => {
      const processor = unified()
        .use(remarkParse)
        .use(wikiLinkPlugin, {
          hrefTemplate: (permalink: string) => permalink,
        });

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.hProperties.href).toEqual("a_page");
      });
    });

    it("uses wikiLinkClassName", () => {
      const processor = unified()
        .use(remarkParse)
        .use(wikiLinkPlugin, {
          wikiLinkClassName: "wiki_link",
          permalinks: ["a_page"],
        });

      let ast = processor.runSync(processor.parse("[[A Page]]"));

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.hProperties.className).toEqual("wiki_link");
      });
    });
  });

  describe("open wiki links", () => {
    it("handles open wiki links", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        permalinks: [],
      });

      let ast = processor.runSync(processor.parse("t[[\nt"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links at end of file", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        permalinks: [],
      });

      let ast = processor.runSync(processor.parse("t [["));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial data", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        permalinks: [],
      });

      let ast = processor.runSync(processor.parse("t [[tt\nt"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial alias divider", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        aliasDivider: "::",
        permalinks: [],
      });

      let ast = processor.runSync(processor.parse("[[t::\n"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });

    it("handles open wiki links with partial alias", () => {
      const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
        permalinks: [],
      });

      let ast = processor.runSync(processor.parse("[[t:\n"));

      expect(!select("wikiLink", ast)).toBeTruthy();
    });
  });
});
