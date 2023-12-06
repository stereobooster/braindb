import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
// @ts-expect-error
import wikiLinkPlugin from "remark-wiki-link";
import remarkStringify from "remark-stringify";
// https://github.com/remarkjs/remark-gfm#when-should-i-use-this
// import remarkGfm from "remark-gfm";
// import remarkRehype from "remark-rehype";
// import rehypeSlug from "rehype-slug";
import { unified } from "unified";

// import type {Processor} from 'unified'
// import type {Root} from 'mdast'
export const mdParser = unified()
  // @ts-expect-error
  .use(remarkParse)
  // @ts-expect-error
  .use(remarkFrontmatter)
  // .use(remarkGfm)
  .use(wikiLinkPlugin, {
    hrefTemplate: (permalink: any) => permalink,
    pageResolver: (name: any) => [decodeURI(name).toLowerCase()],
    aliasDivider: "|",
    wikiLinkClassName: " ",
    newClassName: " ",
  })
  // .use(remarkRehype, { allowDangerousHtml: true, fragment: true })
  // .use(rehypeSlug)
  // @ts-expect-error
  .use(remarkStringify, { resourceLink: false });
