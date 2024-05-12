import { describe, it, expect } from "vitest";
import { micromark } from "micromark";
import { syntax, html } from "../src/index.ts";

describe("micromark-extension-wiki-link", () => {
  it("parses a wiki link that has a matching permalink", () => {
    let serialized = micromark("[[Wiki Link]]", {
      extensions: [syntax()],
      htmlExtensions: [html({ permalinks: ["wiki_link"] })],
    });

    expect(serialized).toEqual(
      '<p><a href="#/page/wiki_link" class="internal">Wiki Link</a></p>'
    );
  });

  it("parses a wiki link that has no matching permalink", () => {
    let serialized = micromark("[[Wiki Link]]", {
      extensions: [syntax()],
      htmlExtensions: [html()],
    });

    expect(serialized).toEqual(
      '<p><a href="#/page/wiki_link" class="internal new">Wiki Link</a></p>'
    );
  });

  it("handles wiki links with aliases", () => {
    let serialized = micromark("[[Real Page:Page Alias]]", {
      extensions: [syntax()],
      htmlExtensions: [html()],
    });

    expect(serialized).toEqual(
      '<p><a href="#/page/real_page" class="internal new">Page Alias</a></p>'
    );
  });

  it("handles wiki links with a custom alias divider", () => {
    let serialized = micromark("[[Real Page||Page Alias]]", {
      extensions: [syntax({ aliasDivider: "||" })],
      htmlExtensions: [html()],
    });

    expect(serialized).toEqual(
      '<p><a href="#/page/real_page" class="internal new">Page Alias</a></p>'
    );
  });

  describe("open wiki links", () => {
    it("handles open wiki links", () => {
      let serialized = micromark("t[[\nt", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });

      expect(serialized).toEqual("<p>t[[\nt</p>");
    });

    it("handles open wiki links at end of file", () => {
      let serialized = micromark("t [[", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });

      expect(serialized).toEqual("<p>t [[</p>");
    });

    it("handles open wiki links with partial data", () => {
      let serialized = micromark("t [[tt\nt", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });

      expect(serialized).toEqual("<p>t [[tt\nt</p>");
    });

    it("handles open wiki links with partial alias divider", () => {
      let serialized = micromark("[[t|\nt", {
        extensions: [syntax({ aliasDivider: "||" })],
        htmlExtensions: [html()],
      });

      expect(serialized).toEqual("<p>[[t|\nt</p>");
    });

    it("handles open wiki links with partial alias", () => {
      let serialized = micromark("[[t:\nt", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });

      expect(serialized).toEqual("<p>[[t:\nt</p>");
    });
  });

  describe("configuration options", () => {
    it("uses pageResolver", () => {
      let identity = (name) => [name];

      let serialized = micromark("[[A Page]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            pageResolver: identity,
            permalinks: ["A Page"],
          }),
        ],
      });

      expect(serialized).toEqual(
        '<p><a href="#/page/A Page" class="internal">A Page</a></p>'
      );
    });

    it("uses newClassName", () => {
      let serialized = micromark("[[A Page]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            newClassName: "new_page",
          }),
        ],
      });

      expect(serialized).toEqual(
        '<p><a href="#/page/a_page" class="internal new_page">A Page</a></p>'
      );
    });

    it("uses hrefTemplate", () => {
      let hrefTemplate = (permalink) => permalink;
      let serialized = micromark("[[A Page]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            hrefTemplate: hrefTemplate,
          }),
        ],
      });

      expect(serialized).toEqual(
        '<p><a href="a_page" class="internal new">A Page</a></p>'
      );
    });

    it("uses wikiLinkClassName", () => {
      let serialized = micromark("[[A Page]]", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            wikiLinkClassName: "wiki_link",
            permalinks: ["a_page"],
          }),
        ],
      });

      expect(serialized).toEqual(
        '<p><a href="#/page/a_page" class="wiki_link">A Page</a></p>'
      );
    });
  });
});
