import { BasePlugin } from "./base.js";
import { MarkdownPlugin } from "./markdown.js";

const plugins: Record<string, BasePlugin> = {
  ".md": new MarkdownPlugin(),
  ".mdx": new MarkdownPlugin(),
  // ".json":
  // ".jpg", ".png", ".svg"
};

export function getPlugin(extension: string) {
  return plugins[extension];
}
