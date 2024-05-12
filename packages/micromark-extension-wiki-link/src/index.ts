import { WikiLinkHtmlOptions } from "./html.js";
import { WikiLinkSyntaxOptions } from "./syntax.js";

export { html } from "./html.js";
export { syntax } from "./syntax.js";

export type WikiLinkOptions = WikiLinkHtmlOptions & WikiLinkSyntaxOptions;
