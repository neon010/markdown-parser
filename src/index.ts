import { tokenize, Token } from './lexer';
import { parse } from './parser';

/**
 * Class-based Markdown parser
 */
export class MarkdownParser {
    private plugins: Array<(token: Token) => string | null>;

    constructor() {
        // Initialize with the table plugin by default
        this.plugins = [this.tablePlugin];
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
        if (token.type === 'table') {
            const rows = token.content.trim().split('\n');
            const headers = rows[0]
                .split('|')
                .filter((header) => header.trim() !== '')
                .map((header) => `<th>${header.trim()}</th>`)
                .join('');

            const body = rows
                .slice(2) // Skip header and delimiter
                .map((row) =>
                    `<tr>${row
                        .split('|')
                        .filter((cell) => cell.trim() !== '')
                        .map((cell) => `<td>${cell.trim()}</td>`)
                        .join('')}</tr>`
                )
                .join('');

            return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
        }

        return null;
    }
}
