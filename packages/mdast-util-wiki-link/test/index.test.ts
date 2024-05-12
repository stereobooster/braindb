import { describe, it, expect } from "vitest";

import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { visit } from "unist-util-visit";
import { syntax } from "@braindb/micromark-extension-wiki-link";

import * as wikiLink from "../src/index.js";
import { type WikiLinkNode } from "../src/index.js";

function assertWikiLink(obj: any): asserts obj is WikiLinkNode {
  if (
    !obj.data ||
    obj.data.exists === undefined ||
    obj.data.permalink === undefined
  ) {
    throw new Error("Not a wiki link");
  }
}

describe("mdast-util-wiki-link", () => {
  describe("fromMarkdown", () => {
    it("parses a wiki link that has a matching permalink", () => {
      const ast = fromMarkdown("[[Wiki Link]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown({
            permalinks: ["wiki_link"],
          }),
        ],
      });

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
      const ast = fromMarkdown("[[New Page]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown({
            permalinks: [],
          }),
        ],
      });

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
      const ast = fromMarkdown("[[Real Page:Page Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLink.fromMarkdown({
            permalinks: [],
          }),
        ],
      });

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

    describe("configuration options", () => {
      it("uses pageResolver", () => {
        const identity = (name: string) => [name];

        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              pageResolver: identity,
              permalinks: ["A Page"],
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.exists).toEqual(true);
          expect(node.data.permalink).toEqual("A Page");
          expect(node.data.hProperties.href).toEqual("#/page/A Page");
        });
      });

      it("uses newClassName", () => {
        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              newClassName: "new_page",
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.hProperties.className).toEqual("internal new_page");
        });
      });

      it("uses hrefTemplate", () => {
        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              hrefTemplate: (permalink: string | undefined) => permalink || "",
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.hProperties.href).toEqual("a_page");
        });
      });

      it("uses wikiLinkClassName", () => {
        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              wikiLinkClassName: "wiki_link",
              permalinks: ["a_page"],
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.hProperties.className).toEqual("wiki_link");
        });
      });
    });
  });

  describe("toMarkdown", () => {
    it("stringifies wiki links", () => {
      const ast = fromMarkdown("[[Wiki Link]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      const stringified = toMarkdown(ast, {
        // @ts-expect-error
        extensions: [wikiLink.toMarkdown()],
      }).trim();

      expect(stringified).toEqual("[[Wiki Link]]");
    });

    it("stringifies aliased wiki links", () => {
      const ast = fromMarkdown("[[Real Page:Page Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      const stringified = toMarkdown(ast, {
        // @ts-expect-error
        extensions: [wikiLink.toMarkdown()],
      }).trim();

      expect(stringified).toEqual("[[Real Page:Page Alias]]");
    });

    describe("configuration options", () => {
      it("uses aliasDivider", () => {
        const ast = fromMarkdown("[[Real Page:Page Alias]]", {
          extensions: [syntax()],
          mdastExtensions: [wikiLink.fromMarkdown()],
        });

        const stringified = toMarkdown(ast, {
          // @ts-expect-error
          extensions: [wikiLink.toMarkdown({ aliasDivider: "|" })],
        }).trim();

        expect(stringified).toEqual("[[Real Page|Page Alias]]");
      });
    });
  });
});
