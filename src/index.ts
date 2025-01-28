import { tokenize, Token } from "./lexer";
import { parse } from "./parser";

/**
 * Markdown parser class
 */
export class MarkdownParser {
  private plugins: Array<(token: Token) => string | null>;

  constructor() {
    // Initialize with the table plugin by default
    this.plugins = [this.tablePlugin, this.blockQuotePlugin, this.imagePlugin, this.linkPlugin];
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
      const rows = token.content.trim().split("\n");

      // Ensure there are enough rows for headers and body
      if (rows.length < 2) {
        return null; // Invalid table structure
      }

      const headers = rows[0]
        .split("|")
        .filter((header) => header.trim() !== "")
        .map((header) => `<th>${header.trim()}</th>`)
        .join("");

      const body = rows
        .slice(2) // Skip header and delimiter
        .map(
          (row) =>
            `<tr>${row
              .split("|")
              .filter((cell) => cell.trim() !== "")
              .map((cell) => `<td>${cell.trim()}</td>`)
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
    if (token.type === "paragraph" && token.content?.includes("**")) {
      return `<p>${token.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
    }
    return null;
  }
  private imagePlugin(token: Token): string | null {
    if (token.type === "paragraph" && token.content && /!\[([^\]]*)\]\(([^)]+)\)/.test(token.content)) {
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
    if (token.type === "paragraph" && token.content && /\[([^\]]+)\]\(([^)]+)\)/.test(token.content)) {
      // Process content only if it contains a link markdown syntax
      const res = token.content.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g, // Match [Text](URL)
        (_, text, href) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      );
      return `<p>${res}</p>`;
    }
    return null;
  }
    
  
}

// const markdown = `
// This is google link: [Google](https://google.com)
//     `;

const markdown = `
###### This is a heading 6
## this is a heading 2
### this is a heading 3
Here is an image: ![Alt text](https://example.com/image.png).
![Another image](https://example.com/another.png).
this is bold text example: **This is bold text**
This is google link: [Google](https://google.com)
[Example-linkl](https://example.com)
| Name  | Age |
|-------|-----|
| Alice |  25 |
| Bob   |  30 |
    `;

const parser = new MarkdownParser();

const html = parser.render(markdown);

console.log(html);

