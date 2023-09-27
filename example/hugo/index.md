---
title: Home page
---

Read more here: https://gohugo.io/content-management/urls/

## HTML link - not supported

<a href="1">1</a>

## Markdown link

### Web link

[internal link](posts/post)
[internal link with anchor](posts/post#2)
[internal link](/example/hugo/posts/post)
[internal link with anchor](/example/hugo/posts/post#2)

#### Unsupported

[page variables][pagevars]
[pagevars]: /example/hugo/posts/post

### Portable link

[internal link](./posts/post.md)
[internal link](posts/post.md)
[internal link](/example/hugo/posts/post.md)

### External link

[external link](http://example.com)
[external link](http://example.com#anchor)
[external link](http://example.com?query)

## Autolink

https://example.com
https://example.com#anchor
https://example.com?query
