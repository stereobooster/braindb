import { describe, it, expect } from "vitest";

import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { visit } from "unist-util-visit";
import { syntax } from "@braindb/micromark-extension-wiki-link";

import * as wikiLink from "../src/index.js";
import { type WikiLinkNode } from "../src/index.js";

function assertWikiLink(obj: any): asserts obj is WikiLinkNode {
  if (!obj.data || !("alias" in obj.data) || !("permalink" in obj.data)) {
    throw new Error("Not a wiki link");
  }
}

describe("mdast-util-wiki-link", () => {
  describe("fromMarkdown", () => {
    it("parses a wiki link", () => {
      const ast = fromMarkdown("[[Wiki Link]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.permalink).toEqual(undefined);
        expect(node.data.hName).toEqual("a");
        expect(node.data.hProperties.href).toEqual("Wiki Link");
        expect(node.data.hChildren[0].value).toEqual("Wiki Link");
      });
    });

    it("handles wiki links with aliases", () => {
      const ast = fromMarkdown("[[Real Page|Page Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      visit(ast, "wikiLink", (node: WikiLinkNode) => {
        assertWikiLink(node);
        expect(node.data.alias).toEqual("Page Alias");
        expect(node.data.permalink).toEqual(undefined);
        expect(node.value).toEqual("Real Page");
        expect(node.data.hName).toEqual("a");
        expect(node.data.hProperties.href).toEqual("Real Page");
        expect(node.data.hChildren[0].value).toEqual("Page Alias");
      });
    });

    describe("configuration options", () => {
      it("uses linkResolver", () => {
        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              linkResolver: (x) => x.toLowerCase().replace(" ", "_"),
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.permalink).toEqual("a_page");
          expect(node.data.hProperties.href).toEqual("a_page");
        });
      });

      it("uses linkTemplate", () => {
        const ast = fromMarkdown("[[A Page]]", {
          extensions: [syntax()],
          mdastExtensions: [
            wikiLink.fromMarkdown({
              linkTemplate: ({ slug, permalink, alias }) => ({
                hName: "span",
                hProperties: { "data-href": permalink || slug },
                hChildren: [{ type: "text", value: alias || slug }],
              }),
            }),
          ],
        });

        visit(ast, "wikiLink", (node: WikiLinkNode) => {
          assertWikiLink(node);
          expect(node.data.hName).toEqual("span");
          expect(node.data.hProperties["data-href"]).toEqual("A Page");
          expect(node.data.hChildren[0].value).toEqual("A Page");
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
      const ast = fromMarkdown("[[Real Page|Page Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      const stringified = toMarkdown(ast, {
        // @ts-expect-error
        extensions: [wikiLink.toMarkdown()],
      }).trim();

      expect(stringified).toEqual("[[Real Page|Page Alias]]");
    });

    it("stringifies aliased wiki links when alias is the same as slug", () => {
      const ast = fromMarkdown("[[Real Page|Real Page]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLink.fromMarkdown()],
      });

      const stringified = toMarkdown(ast, {
        // @ts-expect-error
        extensions: [wikiLink.toMarkdown()],
      }).trim();

      expect(stringified).toEqual("[[Real Page|Real Page]]");
    });

    describe("configuration options", () => {
      it("uses aliasDivider", () => {
        const ast = fromMarkdown("[[Real Page|Page Alias]]", {
          extensions: [syntax()],
          mdastExtensions: [wikiLink.fromMarkdown()],
        });

        const stringified = toMarkdown(ast, {
          // @ts-expect-error
          extensions: [wikiLink.toMarkdown({ aliasDivider: ":" })],
        }).trim();

        expect(stringified).toEqual("[[Real Page:Page Alias]]");
      });
    });
  });
});
