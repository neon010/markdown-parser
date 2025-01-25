import { tokenize } from '../src/lexer';

test('tokenizes headers and paragraphs', () => {
    const input = `
# Header
This is a paragraph.
`;
    const tokens = tokenize(input);
    expect(tokens).toEqual([
        { type: 'header', content: '# Header' },
        { type: 'paragraph', content: 'This is a paragraph.' }
    ]);
});
