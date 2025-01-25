import { MarkdownParser } from '../src/';

test('renders headers and paragraphs', () => {
    const parser = new MarkdownParser();
    const markdown = `
# Header
This is a paragraph.
    `;
    const html = parser.render(markdown);
    expect(html).toBe('<h1>Header</h1><p>This is a paragraph.</p>');
});

test('renders h3 header', () => {
    const parser = new MarkdownParser();
    const markdown = `
### Header
This is a paragraph.
    `;
    const html = parser.render(markdown);
    expect(html).toBe('<h3>Header</h3><p>This is a paragraph.</p>');
});

test('supports custom plugins', () => {
    const parser = new MarkdownParser();

    // Add a plugin for bold text
    parser.use((token) => {
        if (token.type === 'paragraph' && token.content.includes('**')) {
            return `<p>${token.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
        }
        return null;
    });

    const markdown = `
This is a **bold** paragraph.
    `;
    const html = parser.render(markdown);
    expect(html).toBe('<p>This is a <strong>bold</strong> paragraph.</p>');
});


test('renders headings correctly', () => {
    const parser = new MarkdownParser();

    const markdown = `
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
`;

    const html = parser.render(markdown);

    expect(html).toBe(
        `<h1>Heading 1</h1>` +
        `<h2>Heading 2</h2>` +
        `<h3>Heading 3</h3>` +
        `<h4>Heading 4</h4>` +
        `<h5>Heading 5</h5>` +
        `<h6>Heading 6</h6>`
    );
});

test('renders a simple table', () => {
    const parser = new MarkdownParser();

    const markdown = `
| Name  | Age |
|-------|-----|
| Alice |  25 |
| Bob   |  30 |
`;

    const html = parser.render(markdown);

    expect(html).toBe(
        `<table>` +
        `<thead><tr><th>Name</th><th>Age</th></tr></thead>` +
        `<tbody>` +
        `<tr><td>Alice</td><td>25</td></tr>` +
        `<tr><td>Bob</td><td>30</td></tr>` +
        `</tbody>` +
        `</table>`
    );
});

