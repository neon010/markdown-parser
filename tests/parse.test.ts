import { parse } from '../src/parser';
import { Token } from "../src/tokenize"; // Adjust the import path as needed

describe('parse', () => {
  it('should handle empty tokens array', () => {
    const tokens: Token[] = [];
    const result = parse(tokens);
    expect(result).toBe('');
  });

  it('should parse headings', () => {
    const tokens: Token[] = [
      { type: 'heading', content: 'Heading 1', level: 1 },
      { type: 'heading', content: 'Heading 2', level: 2 },
    ];
    const result = parse(tokens);
    expect(result).toBe('<h1>Heading 1</h1><h2>Heading 2</h2>');
  });

  it('should parse paragraphs', () => {
    const tokens: Token[] = [
      { type: 'paragraph', content: 'This is a paragraph.' },
      { type: 'paragraph', content: 'Another paragraph.' },
    ];
    const result = parse(tokens);
    expect(result).toBe('<p>This is a paragraph.</p><p>Another paragraph.</p>');
  });

  it('should parse unordered lists', () => {
    const tokens: Token[] = [
      { type: 'unordered_list', items: ['Item 1', 'Item 2', 'Item 3'] },
    ];
    const result = parse(tokens);
    expect(result).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
  });

  it('should parse ordered lists', () => {
    const tokens: Token[] = [
      { type: 'ordered_list', items: ['Item 1', 'Item 2', 'Item 3'] },
    ];
    const result = parse(tokens);
    expect(result).toBe('<ol><li>Item 1</li><li>Item 2</li><li>Item 3</li></ol>');
  });

  it('should parse blockquotes', () => {
    const tokens: Token[] = [
      { type: 'blockquote', content: 'This is a blockquote.' },
    ];
    const result = parse(tokens);
    expect(result).toBe('<blockquote><p>This is a blockquote.</p></blockquote>');
  });

  it('should parse images', () => {
    const tokens: Token[] = [
      { type: 'image', src: 'https://example.com/image.png', alt: 'Alt text' },
    ];
    const result = parse(tokens);
    expect(result).toBe('<img src="https://example.com/image.png" alt="Alt text" />');
  });

  it('should parse links', () => {
    const tokens: Token[] = [
      { type: 'link', href: 'https://example.com', text: 'Link text' },
    ];
    const result = parse(tokens);
    expect(result).toBe('<a href="https://example.com">Link text</a>');
  });

  it('should handle mixed content', () => {
    const tokens: Token[] = [
      { type: 'heading', content: 'Heading', level: 1 },
      { type: 'paragraph', content: 'This is a paragraph.' },
      { type: 'unordered_list', items: ['Item 1', 'Item 2'] },
      { type: 'blockquote', content: 'This is a blockquote.' },
      { type: 'image', src: 'https://example.com/image.png', alt: 'Alt text' },
      { type: 'link', href: 'https://example.com', text: 'Link text' },
    ];
    const result = parse(tokens);
    expect(result).toBe(
      '<h1>Heading</h1><p>This is a paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul><blockquote><p>This is a blockquote.</p></blockquote><img src="https://example.com/image.png" alt="Alt text" /><a href="https://example.com">Link text</a>'
    );
  });

  it('should use plugins if provided', () => {
    const tokens: Token[] = [
      { type: 'heading', content: 'Heading', level: 1 },
    ];
    const plugin = (token: Token) => {
      if (token.type === 'heading') {
        return `<div class="custom-heading">${token.content}</div>`;
      }
      return null;
    };
    const result = parse(tokens, [plugin]);
    expect(result).toBe('<div class="custom-heading">Heading</div>');
  });

  it('should fall back to default rendering if plugins return null', () => {
    const tokens: Token[] = [
      { type: 'heading', content: 'Heading', level: 1 },
    ];
    const plugin = (token: Token) => null; // Plugin returns null
    const result = parse(tokens, [plugin]);
    expect(result).toBe('<h1>Heading</h1>');
  });

  it('should handle invalid or incomplete tokens gracefully', () => {
    const tokens: Token[] = [
      { type: 'heading', content: 'Heading', level: undefined }, // Invalid token
      { type: 'paragraph', content: undefined }, // Invalid token
    ];
    const result = parse(tokens);
    expect(result).toBe('');
  });

  //   it('should handle inline links and images in paragraphs', () => {
//     const tokens: Token[] = [
//       {
//         type: 'paragraph',
//         content: 'This is a paragraph with a [link](https://example.com) and an ![image](https://example.com/image.png).',
//       },
//     ];
//     const result = parse(tokens);
//     expect(result).toBe(
//       '<p>This is a paragraph with a <a href="https://example.com">link</a> and an <img src="https://example.com/image.png" alt="image" />.</p>'
//     );
//   });

});