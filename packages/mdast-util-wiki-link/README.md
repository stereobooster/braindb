# @braindb/mdast-util-wiki-link

fork of https://github.com/landakram/mdast-util-wiki-link

---

Extension for [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown) and
[`mdast-util-to-markdown`](https://github.com/syntax-tree/mdast-util-to-markdown) to support `[[Wiki Links]]`.

- Parse wiki-style links and render them as anchors
- Differentiate between "new" and "existing" wiki links by giving the parser a list of existing permalinks
- Parse aliased wiki links i.e `[[Real Page|Page Alias]]`

Using [remark](https://github.com/remarkjs/remark)? You might want to use
[`@braindb/remark-wiki-link`](https://github.com/stereobooster/braindb/tree/main/packages/remark-wiki-link) instead of using this package directly.

## Usage

### Markdown to AST

```javascript
import fromMarkdown from "mdast-util-from-markdown";
import { syntax } from "@braindb/micromark-extension-wiki-link";
import * as wikiLink from "@braindb/mdast-util-wiki-link";

let ast = fromMarkdown("[[Test Page]]", {
  extensions: [syntax()],
  mdastExtensions: [wikiLink.fromMarkdown()],
});
```

The AST node will look like this:

```javascript
{
    value: 'Test Page',
    data: {
        alias: 'Test Page',
        permalink: 'Test Page',
        hName: 'a',
        hProperties: {
            href: 'Test Page',
        },
        hChildren: [{
            type: 'text',
            value: 'Test Page'
        }]
    }
}
```

- `value`: slug of the page
- `data.alias`: The display name for this link
- `data.permalink`: The permalink for this page. This permalink is computed from `node.value` using `options.linkResolver`, which can be passed in when initializing the plugin.
- `data.hProperties.href`: `href` value for the rendered `a`. This `href` is computed using `options.hrefTemplate`.

The `hName` and other `h` fields provide compatibility with [`rehype`](https://github.com/rehypejs/rehype).

### AST to Markdown

Taking the `ast` from the prior example, let's go back to markdown:

```javascript
import { fromMarkdown } from "mdast-util-from-markdown";
import * as wikiLink from "@braindb/mdast-util-wiki-link";

let markdownString = toMarkdown(ast, {
  extensions: [wikiLink.toMarkdown()],
}).trim();
console.log(markdownString);
// [[Wiki Link]]
```

### Configuration options

Both `fromMarkdown` and `toMarkdown` accept configuration as an object.

For example, one may configure `fromMarkdown` like so:

```javascript
let ast = fromMarkdown("[[Test Page]]", {
  extensions: [syntax()],
  mdastExtensions: [
    wikiLink.fromMarkdown({
      linkResolver: (x) => name.replace(/ /g, "_").toLowerCase(),
    }),
  ], // <--
});
```

#### `fromMarkdown`

- `options.linkResolver (pageName: string) -> string`: A function that maps a page name to an array of possible permalinks. These possible permalinks are cross-referenced with `options.permalinks` to determine whether a page exists. If a page doesn't exist, the first element of the array is considered the permalink.

  The default `linkResolver` is:

  ```javascript
  (name) => name;
  ```

- `options.linkTemplate ({ slug: string, permalink: string, alias: string | null }) -> HAST`: A function that generates "HAST" for link.

  The default `linkTemplate` is:

  ```js
  function defaultLinkTemplate({ slug, permalink, alias }) {
    return {
      hName: "a",
      hProperties: { href: permalink == null ? slug : permalink },
      hChildren: [{ type: "text", value: alias == null ? slug : alias }],
    };
  }
  ```

#### `toMarkdown`

- `options.aliasDivider string`: a string to be used as the divider for aliases. See the section below on [Aliasing pages](#aliasing-pages). Defaults to `"|"`.

### Aliasing pages

Aliased pages are supported with the following markdown syntax:

```md
[[Real Page|Page Alias]]
```

And will produce this HTML when rendered:

```html
<a href="Real Page">Page Alias</a>
```
