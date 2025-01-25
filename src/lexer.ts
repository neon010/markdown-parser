export interface Token {
    type: string;
    content: string;
}

/**
 * Converts raw Markdown into tokens
 */
export function tokenize(input: string): Token[] {
    const lines = input.split('\n');
    const tokens: Token[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect tables
        if (line.startsWith('|') && lines[i + 1]?.startsWith('|-')) {
            const tableLines = [];
            while (i < lines.length && lines[i].startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }
            i--; // Step back to avoid skipping the next line
            tokens.push({ type: 'table', content: tableLines.join('\n') });
        } else if (line.startsWith('#')) {
            tokens.push({ type: 'header', content: line });
        } else if (line.trim().length > 0) {
            tokens.push({ type: 'paragraph', content: line });
        }
    }

    return tokens;
}
