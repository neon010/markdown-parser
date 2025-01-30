/**
 * Token interface
 */
export interface Token {
  type: 'heading' | 'paragraph' | 'table' | 'image' | 'link' | 'unordered_list' | 'ordered_list' | 'blockquote' | 'code_block' | 'horizontal_rule'; // Token type
  content?: string; // For heading, paragraph, table, and code_block
  level?: number; // Used for headings
  src?: string; // Used for images
  alt?: string; // Used for images
  href?: string; // Used for links
  text?: string; // Used for links
  items?: string[]; // Used for lists

}

/**
* Converts raw Markdown into tokens
*/
export function tokenize(input: string): Token[] {
const lines = input.split('\n');
const tokens: Token[] = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    i++;
    continue; // Skip empty lines
  }

  const token = detectToken(trimmedLine, lines, i);
  if (token) {
    tokens.push(token.token);
    i = token.newIndex;
  } else {
    tokens.push({ type: 'paragraph', content: trimmedLine });
    i++;
  }
}

return tokens;
}

function detectToken(line: string, lines: string[], index: number): { token: Token, newIndex: number } | null {
const headingToken = detectHeading(line);
if (headingToken) return { token: headingToken, newIndex: index + 1 };

  // Add horizontal rule detection before other block elements
  const hrToken = detectHorizontalRule(line);
  if (hrToken) return { token: hrToken, newIndex: index + 1 };


const orderedListToken = detectOrderedList(lines, index);
if (orderedListToken) return orderedListToken;

const unorderedListToken = detectUnorderedList(lines, index);
if (unorderedListToken) return unorderedListToken;

const blockquoteToken = detectBlockquote(lines, index);
if (blockquoteToken) return blockquoteToken;

const imageToken = detectImage(line);
if (imageToken) return { token: imageToken, newIndex: index + 1 };

const linkToken = detectLink(line);
if (linkToken) return { token: linkToken, newIndex: index + 1 };

const tableToken = detectTable(lines, index);
if (tableToken) return tableToken;

const codeBlockToken = detectCodeBlock(lines, index);
if (codeBlockToken) return codeBlockToken;

return null;
}

function detectHeading(line: string): Token | null {
  const match = /^(#{1,6})\s+(.*)$/.exec(line);
  if (match) {
    return {
      type: 'heading',
      content: match[2],
      level: match[1].length,
    };
  }
  return null;
}

function detectOrderedList(lines: string[], index: number): { token: Token, newIndex: number } | null {
  const match = /^\d+\.\s+(.*)$/.exec(lines[index].trim());
  if (match) {
    const items: string[] = [];
    while (index < lines.length && /^\d+\.\s+(.*)$/.test(lines[index].trim())) {
      items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
      index++;
    }
    return { token: { type: 'ordered_list', items }, newIndex: index };
  }
  return null;
}

function detectUnorderedList(lines: string[], index: number): { token: Token, newIndex: number } | null {
  const match = /^[-*]\s+(.*)$/.exec(lines[index].trim());
  if (match) {
    const items: string[] = [];
    while (index < lines.length && /^[-*]\s+(.*)$/.test(lines[index].trim())) {
      items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
      index++;
    }
    return { token: { type: 'unordered_list', items }, newIndex: index };
  }
  return null;
}

function detectBlockquote(lines: string[], index: number): { token: Token, newIndex: number } | null {
  if (lines[index].trim().startsWith('>')) {
    const content: string[] = [];
    while (index < lines.length && lines[index].trim().startsWith('>')) {
      content.push(lines[index].trim().replace(/^>\s*/, ''));
      index++;
    }
    return { token: { type: 'blockquote', content: content.join('\n') }, newIndex: index };
  }
  return null;
}

function detectImage(line: string): Token | null {
  const match = /^!\[([^\]]*)\]\(([^)]+)\)\.?$/.exec(line);
  if (match) {
    return {
      type: 'image',
      alt: match[1],
      src: match[2],
    };
  }
  return null;
}

function detectLink(line: string): Token | null {
  const match = /^\[([^\]]+)\]\(([^)]+)\)\.?$/.exec(line);
  if (match) {
    return {
      type: 'link',
      text: match[1],
      href: match[2],
    };
  }
  return null;
}

function detectTable(lines: string[], index: number): { token: Token, newIndex: number } | null {
  const tableRows: string[] = [];

  while (index < lines.length) {
    const line = lines[index].trim();

    // Stop if we encounter a non-empty line that doesn't resemble a table row
    if (!line.startsWith("|") || !line.endsWith("|")) {
      // Allow incomplete rows (e.g., "| Missing Header")
      if (line.startsWith("|")) {
        tableRows.push(line);
      } else {
        break;
      }
    } else {
      tableRows.push(line);
    }

    index++;
  }

  if (tableRows.length > 0) {
    return { token: { type: "table", content: tableRows.join("\n") }, newIndex: index };
  }

  return null;
}

function detectCodeBlock(lines: string[], index: number): { token: Token, newIndex: number } | null {
  if (lines[index].trim().startsWith('```')) {
    const codeLines: string[] = [];
    const language = lines[index].trim().slice(3).trim(); // Capture the optional language
    let i = index + 1;

    while (i < lines.length && !lines[i].trim().startsWith('```')) {
      codeLines.push(lines[i]);
      i++;
    }

    if (i < lines.length && lines[i].trim().startsWith('```')) {
      // Successfully found the closing ```
      return {
        token: {
          type: 'code_block',
          content: codeLines.join('\n')
        },
        newIndex: i + 1
      };
    }
  }

  return null;
}

function detectHorizontalRule(line: string): Token | null {
  // Matches horizontal rules with 3+ hyphens, asterisks, or underscores
  const hrRegex = /^ {0,3}([-*_])(?: *\1){2,} *$/;
  return hrRegex.test(line) ? { type: 'horizontal_rule' } : null;
}