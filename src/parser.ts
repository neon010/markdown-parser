import { Token } from './lexer';

/**
 * Parses tokens into HTML
 */
export function parse(tokens: Token[], plugins: Array<(token: Token) => string | null> = []): string {
    return tokens.map((token) => {
        // Allow plugins to process the token
        for (const plugin of plugins) {
            const result = plugin(token);
            if (result) return result;
        }

        // Default rendering logic
        switch (token.type) {
            case 'header': {
                const match = token.content.match(/^(#{1,6})\s+(.*)$/);
                if (match) {
                    const level = match[1].length;
                    return `<h${level}>${match[2]}</h${level}>`;
                }
                break;
            }
            case 'paragraph':
                return `<p>${token.content}</p>`;
        }
        return '';
    }).join('');
}
