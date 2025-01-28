import { Token } from './lexer';

/**
 * Parses tokens into HTML
 */
/**
 * Parses tokens into HTML
 */
export function parse(tokens: Token[], plugins: Array<(token: Token) => string | null> = []): string {
    return tokens
      .map((token) => {
        // Allow plugins to process the token
        for (const plugin of plugins) {
          const result = plugin(token);
          if (result) return result;
        }
  
        // Default rendering logic
        switch (token.type) {
          case 'heading':
            if (token.content && token.level) {
              return `<h${token.level}>${token.content}</h${token.level}>`;
            }
            break;
  
          case 'paragraph':
            if (token.content) {
              // Inline parsing for links and images within paragraphs
              const content = token.content.replace(
                /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g,
                (_, alt, src, text, href) =>
                  alt && src
                    ? `<img alt="${alt}" src="${src}" />`
                    : text && href
                    ? `<a href="${href}">${text}</a>`
                    : ''
              );
              return `<p>${content}</p>`;
            }
            break;
  
          case 'unordered_list':
            if (token.items && Array.isArray(token.items)) {
              const listItems = token.items
                .map((item) => `<li>${item}</li>`)
                .join('');
              return `<ul>${listItems}</ul>`;
            }
            break;
  
          case 'ordered_list':
            if (token.items && Array.isArray(token.items)) {
              const listItems = token.items
                .map((item) => `<li>${item}</li>`)
                .join('');
              return `<ol>${listItems}</ol>`;
            }
            break;
  
          case 'table':
            if (token.content) {
              const rows = token.content.trim().split('\n');
              const headers = rows[0]
                .split('|')
                .filter((header) => header.trim() !== '')
                .map((header) => `<th>${header.trim()}</th>`)
                .join('');
              const body = rows
                .slice(1) // Skip the header
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
            break;
  
          case 'image':
            if (token.src) {
              const altText = token.alt || ''; // Use empty alt text if undefined
              return `<img src="${token.src}" alt="${altText}" />`;
            }
            break;
  
          case 'link':
            if (token.href && token.text) {
              return `<a href="${token.href}">${token.text}</a>`;
            }
            break;
  
          default:
            return ''; // Fallback for unhandled token types
        }
  
        return ''; // Fallback for invalid or incomplete tokens
      })
      .join('');
  }
  
