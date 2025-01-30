import { tokenize, Token } from "./tokenize";
import { parse } from "./parser";

/**
 * Markdown parser class
 */
export class MarkdownParser {
  private plugins: Array<(token: Token) => string | null>;

  constructor() {
    // Initialize with the table plugin by default
    this.plugins = [
      this.tablePlugin,
      this.blockQuotePlugin.bind(this),
      this.imagePlugin,
      this.linkPlugin,
    ];
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
      // Split rows, filter out empty lines, and trim each row
      const rows = token.content
        .trim()
        .split("\n")
        .map((row) => row.trim())
        .filter((row) => row.length > 0);

      // Ensure there are enough rows for headers and body
      if (rows.length < 2) {
        return null; // Invalid table structure
      }

      // Extract headers
      const headers = rows[0]
        .split("|")
        .map((header) => header.trim())
        .filter((header) => header !== "")
        .map((header) => `<th>${header}</th>`)
        .join("");

      // Extract table body (skip the first two rows: headers and delimiter)
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

  /**
   * block quote plugin to convert image tokens to HTML
   */
  private blockQuotePlugin(token: Token): string | null {
    console.log(token);
    if (
      token.type === "paragraph" &&
      token.content &&
      // Check for valid markdown patterns (paired symbols or inline code)
      (
        /<.*?>/.test(token.content) || // Check for HTML tags
        /\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~|`.*?`/.test(token.content) // Check for Markdown patterns, including inline code
      )
    ) {
      let content = token.content;
      console.log("content before", content);
      // Escape HTML first to prevent injection
      content = this.escapeHtml(content);
      console.log("content after", content);
  
      // Process bold: **text** or __text__
      content = content.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
  
      // Process italics: *text* or _text_
      content = content.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
  
      // Process strikethrough: ~~text~~
      content = content.replace(/~~(.*?)~~/g, "<del>$1</del>");
  
      // Process inline code: `code`
      content = content.replace(/`(.*?)`/g, "<code>$1</code>");
  
      return `<p>${content}</p>`;
    }
  
    return null; // Skip processing if no valid markdown
  }
  
  
  // Helper function to escape HTML tags
  private escapeHtml(str: string): string {
    const entityMap: { [key: string]: string } = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#39;',
  };
  return str.replace(/[<>&"']/g, (match) => entityMap[match]);
  }
  
  private imagePlugin(token: Token): string | null {
    if (
      token.type === "paragraph" &&
      token.content &&
      /!\[([^\]]*)\]\(([^)]+)\)/.test(token.content)
    ) {
      // Process content only if it contains an image markdown syntax
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
      // Process content only if it contains a link markdown syntax
      const res = token.content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g, // Match [Text](URL)
        (_, text, href) =>
          `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      );
      return `<p>${res}</p>`;
    }
    return null;
  }
}


const parser = new MarkdownParser();

const markdown = `
\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`;

const html = parser.render(markdown);
console.log(html);

