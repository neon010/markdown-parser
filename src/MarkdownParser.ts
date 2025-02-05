import { tokenize, Token } from "./tokenize";
import { parse } from "./parser";
import {
  imagePlugin,
  inlineStylesPlugin,
  linkPlugin,
  syntaxHighlightPlugin,
  tablePlugin,
} from "./plugins";

/**
 * Markdown parser class
 */
export class MarkdownParser {
  private plugins: Array<(token: Token) => string | null>;
  private useSyntaxHighlighting: boolean;
  private inCodeBlock: boolean;
  private buffer: string = "";
  private currentList: any; // Add this line to define the currentList property

  constructor() {
    // Initialize with default plugins (excluding syntaxHighlightPlugin)
    this.plugins = [
      tablePlugin.bind(this),
      inlineStylesPlugin.bind(this),
      imagePlugin.bind(this),
      linkPlugin.bind(this),
    ];

    // Syntax highlighting is disabled by default
    this.useSyntaxHighlighting = false;
    this.inCodeBlock = false;
    this.currentList = null;
    this.reset();
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
   * Resets the parser to its initial state
   */
  // New methods for streaming support
  reset() {
    // Initialize all stateful properties
    this.inCodeBlock = false;
    this.currentList = null;
    this.buffer = "";
    // Add other stateful properties from your original implementation
  }

  /**
   * Parses a chunk of Markdown text
   * @param chunk A chunk of Markdown text
   * @returns The parsed HTML string
   */
  // New streaming-friendly parse method
  parseChunk(chunk: string): string {
    this.buffer += chunk;
    const lines: string[] = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    let html: string = "";
    for (const line of lines) {
      html += this._parseLine(line);
    }
    return html;
  }

  finalize() {
    let html = "";
    if (this.buffer) {
      html += this._parseLine(this.buffer);
    }
    // Close any remaining open blocks
    if (this.inCodeBlock) html += "</code></pre>";
    this.reset();
    return html;
  }

  private tokenizeStream(line: string): Token[] {
    // Implement your actual tokenization logic here
    const tokens: Token[] = [];

    // Example simple tokenization:
    if (line.startsWith("```")) {
      tokens.push({
        type: "code_block",
        content: line.trim(),
        language: line.replace(/```/g, "").trim(),
      });
    } else if (line.startsWith("#")) {
      const level = line.match(/#/g)?.length || 1;
      tokens.push({
        type: "heading",
        content: line.replace(/#/g, "").trim(),
        level: Math.min(level, 6),
      });
    } else {
      tokens.push({ type: "paragraph", content: line });
    }

    return tokens;
  }

  // Private method for line parsing
  private _parseLine(line: string): string {
    const tokens: Token[] = this.tokenizeStream(line);
    // console.log("token-->", tokens);
    // Your existing parsing logic adapted for single lines
    // ... modified to use this.inCodeBlock, this.currentList etc ...
    let lineHtml: string = ""; // Assuming lineHtml is a string
    if (this.inCodeBlock) {
      lineHtml += this.parseCodeBlockLine(tokens);
    } else {
      lineHtml += this.parseRegularLine(tokens);
    }

    return lineHtml;
  }

  private parseRegularLine(tokens: Token[]): string {
    let html = "";

    for (const token of tokens) {
      switch (token.type) {
        case "heading":
          html += `<h${token.level}>${token.content}</h${token.level}>`;
          break;
        case "code_block":
          this.inCodeBlock = true;
          html += `<pre><code class="language-${token.language}">`;
          break;
        case "paragraph":
          html += this.parseInlineElements(token.content || "");
          break;
      }
    }

    return html;
  }

  private parseInlineElements(text: string): string {
    // Simple inline parsing example
    return `<p>${text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")}</p>`;
  }

  private parseCodeBlockLine(tokens: Token[]): string {
    let html = "";

    for (const token of tokens) {
      if (token.type === "code_block") {
        this.inCodeBlock = false;
        return "</code></pre>";
      }
      html += `${token.content}\n`;
    }

    return html;
  }
}
