import { MarkdownParser } from "../src/MarkdownParser";

describe("MarkdownParser", () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it("should render a heading correctly", () => {
    const markdown = "# Hello World";
    const html = parser.render(markdown);
    expect(html).toBe("<h1>Hello World</h1>\n");
  });

  it("should render a link correctly", () => {
    const markdown = "This is a [link](https://example.com)";
    const html = parser.render(markdown);
    expect(html).toBe(
      '<p>This is a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a></p>\n'
    );
  });

  it("should render an image correctly", () => {
    const markdown = "This is an image: ![alt text](https://example.com/image.png)";
    const html = parser.render(markdown);
    expect(html).toBe(
      '<p>This is an image: <img src="https://example.com/image.png" alt="alt text"></p>\n'
    );
  });

  it("should render an unordered list correctly", () => {
    const markdown = "- Item 1\n- Item 2";
    const html = parser.render(markdown);
    expect(html).toBe(`<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>\n`);
  });

  it("should render an ordered list correctly", () => {
    const markdown = "1. Item 1\n2. Item 2";
    
    const expectedHtml = `
      <ol>
        <li>Item 1</li>
        <li>Item 2</li>
      </ol>
    `.replace(/\s+/g, ' ').trim();
  
    const html = parser.render(markdown).replace(/\s+/g, ' ').trim();
    
    expect(html).toBe(expectedHtml);
  });
  

  it("should render a blockquote correctly", () => {
    const markdown = "> This is a blockquote";
    const html = parser.render(markdown);
    expect(html).toBe(`<blockquote>
  <p>This is a blockquote</p>
</blockquote>\n`);
  });

  it("should render a table correctly", () => {
    const markdown = `
      | Header 1 | Header 2 |
      |----------|----------|
      | Cell 1   | Cell 2   |
      | Cell 3   | Cell 4   |
    `;

    const expectedHtml = [
      "<table>",
      "  <thead>",
      "    <tr>",
      "      <th>Header 1</th>",
      "      <th>Header 2</th>",
      "    </tr>",
      "  </thead>",
      "  <tbody>",
      "    <tr>",
      "      <td>Cell 1</td>",
      "      <td>Cell 2</td>",
      "    </tr>",
      "    <tr>",
      "      <td>Cell 3</td>",
      "      <td>Cell 4</td>",
      "    </tr>",
      "  </tbody>",
      "</table>"
    ].join("\n");

    const html = parser.render(markdown);
    expect(html.replace(/\s+/g, ' ').trim()).toBe(expectedHtml.replace(/\s+/g, ' ').trim());
  });

  it("should return an empty string for empty input", () => {
    const markdown = "";
    const html = parser.render(markdown);
    expect(html).toBe("");
  });

  it("should apply a custom plugin correctly", () => {
    parser.use((token) => {
      if (token.type === "heading" && token.level === 1) {
        return `<h1 class="custom">${token.content}</h1>`;
      }
      return null;
    });

    const markdown = "# Custom Heading";
    const html = parser.render(markdown);
    expect(html).toBe('<h1 class="custom">Custom Heading</h1>\n');
  });

  it("should handle malformed table input gracefully", () => {
    const markdown = `| Header 1 | Header 2 |
    |----------|----------|
    | Cell 1   | Cell 2   |
    | Missing Header`;

    const expectedHtml = `
      <table>
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Missing Header</td>
          </tr>
        </tbody>
      </table>
    `.replace(/\s+/g, ' ').trim();

    const html = parser.render(markdown).replace(/\s+/g, ' ').trim();
    expect(html).toBe(expectedHtml);
  });

  it("should return the original input for unclosed tag", () => {
    const markdown = "This is <b>bold";
    const html = parser.render(markdown);
    expect(html).toBe("<p>This is &lt;b&gt;bold</p>\n");
  });

  it("should return the original input for incorrect syntax", () => {
    const markdown = "This is [an example";
    const html = parser.render(markdown);
    expect(html).toBe("<p>This is [an example</p>\n");
  });

  it("should return the original input for unsupported syntax", () => {
    const markdown = "This is a ^superscript^";
    const html = parser.render(markdown);
    expect(html).toBe("<p>This is a ^superscript^</p>\n");
  });

  it("should correctly process inline code", () => {
    const markdown = "This is `inline code`.";
    const html = parser.render(markdown);
    expect(html).toBe("<p>This is <code>inline code</code>.</p>\n");
  });

  it("should handle mixed markdown correctly", () => {
    const markdown = "This is **bold**, *italic*, ~~strikethrough~~, and `inline code`.";
    const html = parser.render(markdown);
    expect(html).toBe(
      "<p>This is <strong>bold</strong>, <em>italic</em>, <del>strikethrough</del>, and <code>inline code</code>.</p>\n"
    );
  });

  it("should escape HTML characters in a code block", () => {
    const markdown = `
  \`\`\`
  console.log("Hello, world!");
  \`\`\`
  `;
    const expectedOutput = `
  <pre>
    <code>
  console.log(&quot;Hello, world!&quot;);
    </code>
  </pre>`.replace(/\n\s*/g, "");

    const html = parser.render(markdown).replace(/\n\s*/g, "");
    expect(html).toBe(expectedOutput);
  });

  it("renders code blocks", () => {
    const markdown = "```\nconst x = 10;\n```";
    const html = parser.render(markdown);
    expect(html).toBe(`<pre>
  <code>
const x = 10;
  </code>
</pre>\n`);
  });

  it("should escape HTML characters in a code block", () => {
    const markdown = `
\`\`\`
<div>Hello</div>
<div>Hello</div>
\`\`\`
`;
    const expectedOutput = `
<pre>
  <code>
&lt;div&gt;Hello&lt;/div&gt;
&lt;div&gt;Hello&lt;/div&gt;
  </code>
</pre>`;

    const html = parser.render(markdown).trim();
    expect(html).toEqual(expectedOutput.trim());
  });

  it("should handle mixed content, including a code block", () => {
    const markdown = `
# Title

This is a paragraph.

\`\`\`javascript
function greet() {
  return "Hello!";
}
\`\`\`

- Item 1
- Item 2
`;
    const expectedOutput = `
<h1>Title</h1>
<p>This is a paragraph.</p>
<pre><code>function greet() {
  return &quot;Hello!&quot;;
}</code></pre>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
`.replace(/\n\s*/g, "");

    const html = parser.render(markdown).replace(/\n\s*/g, "");
    expect(html).toBe(expectedOutput);
  });

  it("should handle invalid Markdown gracefully", () => {
    const markdown = `
Invalid markdown content
without any proper structure.
`;
    const expectedOutput = `
<p>Invalid markdown content</p>
<p>without any proper structure.</p>`.trim();

    const html = parser.render(markdown).trim();
    expect(html).toBe(expectedOutput);
  });

  it("should handle horizontal rule", () => {
    const markdown = `
# This is a heading
---
This is a paragraph with **bold** and *italic* text.
`;
    const expectedOutput = `
<h1>This is a heading</h1>
<hr />
<p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>`.trim();

    const html = parser.render(markdown).trim();
    expect(html).toBe(expectedOutput);
  });

  it("should highlight code syntax", () => {
    const markdown = `
    \`\`\`javascript
    console.log("Hello, World!");
    \`\`\`
    `;

    parser.enableSyntaxHighlighting(true);
    const html = parser.render(markdown);

    const expectedHtml = `
  <pre class="hljs"><code class="language-javascript">
    <span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(<span class="hljs-string">&quot;Hello, World!&quot;</span>);
  </code></pre>`;

    const normalizeHtml = (str: string) =>
      str
        .split("\n")
        .map((line) => line.trim())
        .join("");

    expect(normalizeHtml(html)).toBe(normalizeHtml(expectedHtml));
  });
});
