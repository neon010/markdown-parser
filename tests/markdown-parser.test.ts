import { MarkdownParser } from '../src/index'; // Import the class

describe('MarkdownParser', () => {
  let parser: MarkdownParser; // Explicitly typing the parser variable

  beforeEach(() => {
    parser = new MarkdownParser(); // Initialize a new instance of MarkdownParser for each test
  });

  // Test 1: Render Markdown with a heading
  it('should render a heading correctly', () => {
    const markdown = '# Hello World';
    const html = parser.render(markdown);
    expect(html).toBe('<h1>Hello World</h1>');
  });

  // Test 2: Render Markdown with a link
  it('should render a link correctly', () => {
    const markdown = 'This is a [link](https://example.com)';
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a></p>');
  });

  // Test 3: Render Markdown with an image
  it('should render an image correctly', () => {
    const markdown = 'This is an image: ![alt text](https://example.com/image.png)';
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is an image: <img src="https://example.com/image.png" alt="alt text"></p>');
  });

  // Test 4: Render Markdown with an unordered list
  it('should render an unordered list correctly', () => {
    const markdown = '- Item 1\n- Item 2';
    const html = parser.render(markdown);
    expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  // Test 5: Render Markdown with an ordered list
  it('should render an ordered list correctly', () => {
    const markdown = '1. Item 1\n2. Item 2';
    const html = parser.render(markdown);
    expect(html).toBe('<ol><li>Item 1</li><li>Item 2</li></ol>');
  });

  // Test 6: Render Markdown with a blockquote
  it('should render a blockquote correctly', () => {
    const markdown = '> This is a blockquote';
    const html = parser.render(markdown);
    expect(html).toBe('<blockquote><p>This is a blockquote</p></blockquote>');
  });

  // Test 7: Render Markdown with a table
  it('should render a table correctly', () => {
    const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    const html = parser.render(markdown);
    expect(html).toBe(
      `<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>`
    );
  });

  // Test 8: Test empty Markdown input
  it('should return an empty string for empty input', () => {
    const markdown = '';
    const html = parser.render(markdown);
    expect(html).toBe('');
  });

  // Test 9: Test adding a custom plugin
  it('should apply a custom plugin correctly', () => {
    // Custom plugin that wraps headings with a special class
    parser.use((token) => {
      if (token.type === 'heading' && token.level === 1) {
        return `<h1 class="custom">${token.content}</h1>`;
      }
      return null;
    });

    const markdown = '# Custom Heading';
    const html = parser.render(markdown);
    expect(html).toBe('<h1 class="custom">Custom Heading</h1>');
  });

  // Test 10: Test malformed Markdown input (missing table delimiter)
  it('should handle malformed table input gracefully', () => {
    const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Missing Header`;
    const html = parser.render(markdown);
    expect(html).toBe('<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Missing Header</td></tr></tbody></table>');
  });

  // Test 11: Test invalid Markdown input (unclosed tag)
  it('should return the original input for unclosed tag', () => {
    const markdown = 'This is <b>bold';
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is &lt;b&gt;bold</p>');
  });

  // Test 12: Test invalid Markdown input (incorrect syntax)
  it('should return the original input for incorrect syntax', () => {
    const markdown = 'This is [an example';
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is [an example</p>');
  });

  // Test 13: Test invalid Markdown input (unsupported syntax)
  it('should return the original input for unsupported syntax', () => {
    const markdown = 'This is a ^superscript^';
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is a ^superscript^</p>');
  });
});
