import { Token } from './tokenize';

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
          return renderHeading(token);
        case 'paragraph':
          return renderParagraph(token);
        case 'unordered_list':
          return renderUnorderedList(token);
        case 'ordered_list':
          return renderOrderedList(token);
        case 'blockquote':
          return renderBlockquote(token);
        case 'table':
          return renderTable(token);
        case 'image':
          return renderImage(token);
        case 'link':
          return renderLink(token);
        default:
          return ''; // Fallback for unhandled token types
      }
    })
    .join('');
}

function renderHeading(token: Token): string {
  if (token.content && token.level) {
    return `<h${token.level}>${token.content}</h${token.level}>`;
  }
  return '';
}

function renderParagraph(token: Token): string {
  if (token.content) {
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
  return '';
}

function renderUnorderedList(token: Token): string {
  if (token.items && Array.isArray(token.items)) {
    const listItems = token.items.map((item) => `<li>${item}</li>`).join('');
    return `<ul>${listItems}</ul>`;
  }
  return '';
}

function renderOrderedList(token: Token): string {
  if (token.items && Array.isArray(token.items)) {
    const listItems = token.items.map((item) => `<li>${item}</li>`).join('');
    return `<ol>${listItems}</ol>`;
  }
  return '';
}

function renderBlockquote(token: Token): string {
  if (token.content) {
    const content = token.content
      .split('\n') // Split blockquote into individual lines
      .map((line) => `<p>${line}</p>`)
      .join(''); // Wrap each line in a paragraph
    return `<blockquote>${content}</blockquote>`;
  }
  return '';
}

function renderTable(token: Token): string {
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
  return '';
}

function renderImage(token: Token): string {
  if (token.src) {
    const altText = token.alt || ''; // Use empty alt text if undefined
    return `<img src="${token.src}" alt="${altText}" />`;
  }
  return '';
}

function renderLink(token: Token): string {
  if (token.href && token.text) {
    return `<a href="${token.href}">${token.text}</a>`;
  }
  return '';
}
