import { BasePlugin } from "./base.js";
import { MarkdownPlugin } from "./markdown.js";
import { MarkdownPluginOptions } from "./parser.js";

export class Plugins {
  private plugins: Record<string, BasePlugin | undefined> = {};

  constructor(opts: MarkdownPluginOptions = {}) {
    this.plugins[".md"] = this.plugins[".mdx"] = new MarkdownPlugin(opts);
  }

  getPlugin(extension: string) {
    return this.plugins[extension];
  }
}
