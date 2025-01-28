/**
 * Token interface
 */
export interface Token {
    type: 'heading' | 'paragraph' | 'table' | 'image' | 'link' | 'unordered_list' | 'ordered_list' | 'blockquote'; // Token type
    content?: string; // For heading, paragraph, and table
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
// export function tokenize(input: string): Token[] {
//     const lines = input.split('\n'); // Split input into lines
//     const tokens: Token[] = [];
//     let tableBuffer: string[] = [];

//     for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim(); // Trim whitespace for cleaner processing

//         // Skip empty lines
//         if (line.length === 0) continue;

//         // Detect headings
//         const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
//         if (headingMatch) {
//             tokens.push({
//                 type: 'heading',
//                 content: headingMatch[2],
//                 level: headingMatch[1].length, // Number of '#' characters determines level
//             });
//             continue;
//         }

//         // Detect images
//         const imageMatches = Array.from(line.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
//         for (const match of imageMatches) {
//             tokens.push({
//                 type: 'image',
//                 alt: match[1], // Alt text
//                 src: match[2], // Image source URL
//             });
//         }
//         // If the line contains only images, skip further processing
//         if (imageMatches.length && line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim() === '') {
//             continue;
//         }

//         // Detect links
//         const linkMatches = Array.from(line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
//         for (const match of linkMatches) {
//             tokens.push({
//                 type: 'link',
//                 text: match[1], // Link text
//                 href: match[2], // Hyperlink URL
//             });
//         }
//         // If the line contains only links, skip further processing
//         if (linkMatches.length && line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '').trim() === '') {
//             continue;
//         }

//         // Detect table start (must have '|' and optional delimiters)
//         if (/^\|.*\|$/.test(line)) {
//             tableBuffer.push(line);

//             // Look ahead to collect the entire table
//             while (i + 1 < lines.length && /^\|.*\|$/.test(lines[i + 1])) {
//                 tableBuffer.push(lines[++i].trim());
//             }

//             // Push a single table token
//             tokens.push({ type: 'table', content: tableBuffer.join('\n') });
//             tableBuffer = [];
//             continue;
//         }

//         // Default: Paragraph token (handles mixed content like text + images/links)
//         tokens.push({ type: 'paragraph', content: line });
//     }

//     return tokens;
// }

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

    // Detect headings
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(trimmedLine);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        content: headingMatch[2],
        level: headingMatch[1].length, // Number of '#' characters determines level
      });
      i++;
      continue;
    }

    // Detect ordered lists (e.g., "1. Item")
    const orderedListMatch = /^\d+\.\s+(.*)$/.exec(trimmedLine);
    if (orderedListMatch) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+(.*)$/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, '')); // Remove "1." prefix
        i++;
      }
      tokens.push({
        type: 'ordered_list',
        items: listItems,
      });
      continue;
    }

    // Detect unordered lists (e.g., "- Item" or "* Item")
    const unorderedListMatch = /^[-*]\s+(.*)$/.exec(trimmedLine);
    if (unorderedListMatch) {
      const listItems: string[] = [];
      while (i < lines.length && /^[-*]\s+(.*)$/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, '')); // Remove "-" or "*" prefix
        i++;
      }
      tokens.push({
        type: 'unordered_list',
        items: listItems,
      });
      continue;
    }

    // Detect blockquotes
    if (trimmedLine.startsWith('>')) {
      const blockquoteContent: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        blockquoteContent.push(lines[i].trim().replace(/^>\s*/, '')); // Remove the ">" prefix
        i++;
      }
      tokens.push({
        type: 'blockquote',
        content: blockquoteContent.join('\n'), // Combine all lines into one block
      });
      continue;
    }

    // Detect standalone images
    const standaloneImageMatch = /^!\[([^\]]*)\]\(([^)]+)\)\.?$/.exec(trimmedLine);
    if (standaloneImageMatch) {
      tokens.push({
        type: 'image',
        alt: standaloneImageMatch[1], // Alt text
        src: standaloneImageMatch[2], // Image source URL
      });
      i++;
      continue;
    }

    // Detect standalone links
    const standaloneLinkMatch = /^\[([^\]]+)\]\(([^)]+)\)\.?$/.exec(trimmedLine);
    if (standaloneLinkMatch) {
      tokens.push({
        type: 'link',
        text: standaloneLinkMatch[1], // Link text
        href: standaloneLinkMatch[2], // Link URL
      });
      i++;
      continue;
    }

    // Detect table start (must have '|' and optional delimiters)
    if (/^\|.*\|$/.test(trimmedLine)) {
      const tableBuffer: string[] = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        tableBuffer.push(lines[i].trim());
        i++;
      }

      tokens.push({ type: 'table', content: tableBuffer.join('\n') });
      continue;
    }

    // Treat the entire line as a paragraph (preserve inline links or images)
    tokens.push({ type: 'paragraph', content: trimmedLine });
    i++;
  }

  return tokens;
}




  
  
  
  











