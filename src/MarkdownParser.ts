import { tokenize, Token } from "./tokenize";
import { parse } from "./parser";
import { syntaxHighlightPlugin } from "./plugins";

/**
 * Markdown parser class
 */
export class MarkdownParser {
  private plugins: Array<(token: Token) => string | null>;
  private useSyntaxHighlighting: boolean;

  constructor() {
    // Initialize with default plugins (excluding syntaxHighlightPlugin)
    this.plugins = [
      this.tablePlugin,
      this.inlineStylesPlugin.bind(this),
      this.imagePlugin,
      this.linkPlugin,
    ];

    // Syntax highlighting is disabled by default
    this.useSyntaxHighlighting = false;
  }

  /**
   * Allows additional plugins to be registered
   * @param plugin A function that processes a token and returns HTML or null
   */
  use(plugin: (token: Token) => string | null): this {
    this.plugins.push(plugin);
    return this;
  }

  /**
   * Enables or disables syntax highlighting
   * @param enable A boolean indicating whether to enable syntax highlighting
   */
  enableSyntaxHighlighting(enable: boolean): this {
    this.useSyntaxHighlighting = enable;

    if (enable) {
      // Add syntaxHighlightPlugin if not already present
      if (!this.plugins.includes(syntaxHighlightPlugin)) {
        this.plugins.push(syntaxHighlightPlugin.bind(this));
      }
    } else {
      // Remove syntaxHighlightPlugin if it exists
      this.plugins = this.plugins.filter(
        (plugin) => plugin !== syntaxHighlightPlugin
      );
    }

    return this;
  }

  /**
   * Renders Markdown input into HTML
   * @param input The Markdown string to be rendered
   * @returns Rendered HTML string
   */
  render(input: string): string {
    // Tokenize the input
    const tokens = tokenize(input);

    // Parse the tokens into HTML
    return parse(tokens, this.plugins);
  }

  /**
   * Table plugin to convert table tokens to HTML
   */
  private tablePlugin(token: Token): string | null {
    if (token.type === "table" && token.content) {
      const rows = token.content
        .trim()
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row.length > 0);

      if (rows.length < 2) {
        return null;
      }

      const headers = rows[0]
        .split("|")
        .map((header) => header.trim())
        .filter((header) => header !== "")
        .map((header) => `<th>${header}</th>`)
        .join("");

      const body = rows
        .slice(2)
        .map(
          (row) =>
            `<tr>${row
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell !== "")
              .map((cell) => `<td>${cell}</td>`)
              .join("")}</tr>`
        )
        .join("");

      return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
    }

    return null;
  }

  private inlineStylesPlugin(token: Token): string | null {
    if (
      token.type === "paragraph" &&
      token.content &&
      (/<.*?>/.test(token.content) ||
        /\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~|`.*?`/.test(token.content))
    ) {
      let content = token.content;
      content = this.escapeHtml(content);
      content = content.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
      content = content.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
      content = content.replace(/~~(.*?)~~/g, "<del>$1</del>");
      content = content.replace(/`(.*?)`/g, "<code>$1</code>");
      return `<p>${content}</p>`;
    }

    return null;
  }

  private escapeHtml(str: string): string {
    const entityMap: { [key: string]: string } = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[<>&"']/g, (match) => entityMap[match]);
  }

  private imagePlugin(token: Token): string | null {
    if (
      token.type === "paragraph" &&
      token.content &&
      /!\[([^\]]*)\]\(([^)]+)\)/.test(token.content)
    ) {
      const res = token.content.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        (_, altText, src) => `<img src="${src}" alt="${altText || ""}">`
      );
      return `<p>${res}</p>`;
    }
    return null;
  }

  private linkPlugin(token: Token): string | null {
    if (
      token.type === "paragraph" &&
      token.content &&
      /\[([^\]]+)\]\(([^)]+)\)/.test(token.content)
    ) {
      const res = token.content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        (_, text, href) =>
          `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      );
      return `<p>${res}</p>`;
    }
    return null;
  }
}


