import { tokenize, Token } from "../src/tokenize"; // Adjust the import path as needed

describe("tokenize", () => {
  it("should handle empty input", () => {
    const input = "";
    const result = tokenize(input);
    expect(result).toEqual([]);
  });

  it("should parse headings", () => {
    const input = `
# Heading 1
## Heading 2
### Heading 3
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "heading", content: "Heading 1", level: 1 },
      { type: "heading", content: "Heading 2", level: 2 },
      { type: "heading", content: "Heading 3", level: 3 },
    ]);
  });

  it("should parse paragraphs", () => {
    const input = `
This is a paragraph.
Another paragraph.
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "paragraph", content: "This is a paragraph." },
      { type: "paragraph", content: "Another paragraph." },
    ]);
  });

  it("should parse unordered lists", () => {
    const input = `
- Item 1
- Item 2
- Item 3
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "unordered_list", items: ["Item 1", "Item 2", "Item 3"] },
    ]);
  });

  it("should parse ordered lists", () => {
    const input = `
1. Item 1
2. Item 2
3. Item 3
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "ordered_list", items: ["Item 1", "Item 2", "Item 3"] },
    ]);
  });

  it("should parse blockquotes", () => {
    const input = `
> This is a blockquote.
> It spans multiple lines.
`;
    const result = tokenize(input);
    expect(result).toEqual([
      {
        type: "blockquote",
        content: "This is a blockquote.\nIt spans multiple lines.",
      },
    ]);
  });

  it("should parse standalone images", () => {
    const input = "![Alt text](https://example.com/image.png)";
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "image", alt: "Alt text", src: "https://example.com/image.png" },
    ]);
  });

  it("should parse standalone links", () => {
    const input = "[Link text](https://example.com)";
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "link", text: "Link text", href: "https://example.com" },
    ]);
  });

  it("should parse tables", () => {
    const input = `
| Header 1 | Header 2 |
|----------|----------|
| Row 1    | Data 1   |
| Row 2    | Data 2   |
`;
    const result = tokenize(input);
    expect(result).toEqual([
      {
        type: "table",
        content:
          "| Header 1 | Header 2 |\n|----------|----------|\n| Row 1    | Data 1   |\n| Row 2    | Data 2   |",
      },
    ]);
  });

  it("should handle mixed content", () => {
    const input = `
# Heading

This is a paragraph.

- Item 1
- Item 2

> Blockquote

![Alt text](https://example.com/image.png)

[Link text](https://example.com)
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "heading", content: "Heading", level: 1 },
      { type: "paragraph", content: "This is a paragraph." },
      { type: "unordered_list", items: ["Item 1", "Item 2"] },
      { type: "blockquote", content: "Blockquote" },
      { type: "image", alt: "Alt text", src: "https://example.com/image.png" },
      { type: "link", text: "Link text", href: "https://example.com" },
    ]);
  });

  it("should skip empty lines", () => {
    const input = `
# Heading

This is a paragraph.


- Item 1
- Item 2
`;
    const result = tokenize(input);
    expect(result).toEqual([
      { type: "heading", content: "Heading", level: 1 },
      { type: "paragraph", content: "This is a paragraph." },
      { type: "unordered_list", items: ["Item 1", "Item 2"] },
    ]);
  });

  //   it('should handle malformed Markdown gracefully', () => {
  //     const input = `
  // # Heading
  // This is not a heading
  // - Item 1
  // * Item 2
  // `;
  //     const result = tokenize(input);
  //     expect(result).toEqual([
  //       { type: 'heading', content: 'Heading', level: 1 },
  //       { type: 'paragraph', content: 'This is not a heading' },
  //       { type: 'unordered_list', items: ['Item 1'] },
  //       { type: 'unordered_list', items: ['Item 2'] },
  //     ]);
  //   });
});
