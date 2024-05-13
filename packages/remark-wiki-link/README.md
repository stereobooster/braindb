# @braindb/remark-wiki-link

fork of https://github.com/landakram/remark-wiki-link

---

This [remark](https://github.com/wooorm/remark) plugin parses and renders `[[Wiki Links]]`.

- Parse wiki-style links and render them as anchors
- Differentiate between "new" and "existing" wiki links by giving the parser a list of existing permalinks
- Parse aliased wiki links i.e `[[Real Page|Page Alias]]`

Looking for lower level packages? Check out [@braindb/mdast-util-wiki-link](https://github.com/stereobooster/braindb/tree/main/packages/mdast-util-wiki-link) for working with ASTs and [@braindb/micromark-extension-wiki-link](https://github.com/stereobooster/braindb/tree/main/packages/micromark-extension-wiki-link) for working with tokens.

## Usage

```javascript
const unified = require("unified");
const markdown = require("remark-parse");
const remarkWikiLink = require("@braindb/remark-wiki-link");

let processor = unified().use(markdown, { gfm: true }).use(remarkWikiLink);
```

When the processor is run, wiki links will be parsed to a `wikiLink` node.

If we have this markdown string:

```md
[[Test Page]]
```

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

When rendered to HTML, we get:

```html
<a href="Test Page">Test Page</a>
```

### Configuration options

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

- `options.aliasDivider`: a string for `aliased pages`. . Defaults to `"|"`.

#### Aliasing pages

Aliased pages are supported with the following markdown syntax:

```md
[[Real Page|Page Alias]]
```

The AST node will look like:

```javascript
{
    value: 'Real Page',
    data: {
        alias: 'Page Alias',
        permalink: 'Real Page',
        hName: 'a',
        hProperties: {
            href: 'Real Page'
        },
        hChildren: [{
            type: 'text',
            value: 'Page Alias'
        }]
    }
}
```

And will produce this HTML when rendered:

```html
<a href="Real Page">Page Alias</a>
```
