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
}
