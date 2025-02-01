/**
 * Token interface
 */
export interface Token {
  type:
    | "heading"
    | "paragraph"
    | "table"
    | "image"
    | "link"
    | "unordered_list"
    | "ordered_list"
    | "blockquote"
    | "code_block"
    | "horizontal_rule"; // Token type
  content?: string; // For heading, paragraph, table, and code_block
  level?: number; // Used for headings
  src?: string; // Used for images
  alt?: string; // Used for images
  href?: string; // Used for links
  text?: string; // Used for links
  items?: string[]; // Used for lists
  language?: string; // Used for code blocks
}

/**
 * Converts raw Markdown into tokens
 */
export function tokenize(input: string): Token[] {
  const lines = input.split("\n");
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
      tokens.push({ type: "paragraph", content: trimmedLine });
      i++;
    }
  }

  return tokens;
}
function detectToken(
  line: string,
  lines: string[],
  index: number
): { token: Token; newIndex: number } | null {
  const headingToken = detectHeading(line);
  if (headingToken) return { token: headingToken, newIndex: index + 1 };

  const hrToken = detectHorizontalRule(line);
  if (hrToken) return { token: hrToken, newIndex: index + 1 };

  const listToken = detectList(lines, index);
  if (listToken) return listToken;

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

function detectList(
  lines: string[],
  index: number
): { token: Token; newIndex: number } | null {
  const orderedMatch = /^\d+\.\s+(.*)$/.exec(lines[index].trim());
  const unorderedMatch = /^[-*]\s+(.*)$/.exec(lines[index].trim());

  if (orderedMatch || unorderedMatch) {
    const items: string[] = [];
    const isOrdered = !!orderedMatch;

    while (index < lines.length && (isOrdered ? /^\d+\.\s+(.*)$/.test(lines[index].trim()) : /^[-*]\s+(.*)$/.test(lines[index].trim()))) {
      items.push(lines[index].trim().replace(isOrdered ? /^\d+\.\s+/ : /^[-*]\s+/, ""));
      index++;
    }

    return { token: { type: isOrdered ? "ordered_list" : "unordered_list", items }, newIndex: index };
  }

  return null;
}

function detectHeading(line: string): Token | null {
  const match = /^(#{1,6})\s+(.*)$/.exec(line);
  if (match) {
    return {
      type: "heading",
      content: match[2],
      level: match[1].length,
    };
  }
  return null;
}

function detectBlockquote(
  lines: string[],
  index: number
): { token: Token; newIndex: number } | null {
  if (lines[index].trim().startsWith(">")) {
    const content: string[] = [];
    while (index < lines.length && lines[index].trim().startsWith(">")) {
      content.push(lines[index].trim().replace(/^>\s*/, ""));
      index++;
    }
    return {
      token: { type: "blockquote", content: content.join("\n") },
      newIndex: index,
    };
  }
  return null;
}
function detectImage(line: string): Token | null {
  const match = /^!\[([^\]]*)\]\(([^)]+)\)\.?$/.exec(line);
  if (match) {
    return {
      type: "image",
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
      type: "link",
      text: match[1],
      href: match[2],
    };
  }
  return null;
}
function detectTable(
  lines: string[],
  index: number
): { token: Token; newIndex: number } | null {
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
    return {
      token: { type: "table", content: tableRows.join("\n") },
      newIndex: index,
    };
  }

  return null;
}
function detectCodeBlock(
  lines: string[],
  index: number
): { token: Token; newIndex: number } | null {
  if (lines[index].trim().startsWith("```")) {
    const codeLines: string[] = [];
    const language = lines[index].trim().slice(3).trim(); // Capture the optional language
    let i = index + 1;

    while (i < lines.length && !lines[i].trim().startsWith("```")) {
      codeLines.push(lines[i]);
      i++;
    }

    if (i < lines.length && lines[i].trim().startsWith("```")) {
      // Successfully found the closing ```
      return {
        token: {
          type: "code_block",
          content: codeLines.join("\n"),
          language,
        },
        newIndex: i + 1,
      };
    }
  }

  return null;
}
function detectHorizontalRule(line: string): Token | null {
  // Matches horizontal rules with 3+ hyphens, asterisks, or underscores
  const hrRegex = /^ {0,3}([-*_])(?: *\1){2,} *$/;
  return hrRegex.test(line) ? { type: "horizontal_rule" } : null;
}
