/**
 * Token interface
 */
export interface Token {
    type: 'heading' | 'paragraph' | 'table' | 'image' | 'link' | 'unordered_list' | 'ordered_list'; // Token type
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
        level: headingMatch[1].length,
      });
      i++;
      continue;
    }

    // Detect standalone images
    const standaloneImageMatch = /^!\[([^\]]*)\]\(([^)]+)\)\.?$/.exec(trimmedLine);
    if (standaloneImageMatch) {
      tokens.push({
        type: 'image',
        alt: standaloneImageMatch[1],
        src: standaloneImageMatch[2],
      });
      i++;
      continue;
    }

    // Detect standalone links
    const standaloneLinkMatch = /^\[([^\]]+)\]\(([^)]+)\)\.?$/.exec(trimmedLine);
    if (standaloneLinkMatch) {
      tokens.push({
        type: 'link',
        text: standaloneLinkMatch[1],
        href: standaloneLinkMatch[2],
      });
      i++;
      continue;
    }

    // Detect unordered lists
    const unorderedListMatch = /^[-*+]\s+(.+)$/.exec(trimmedLine);
    if (unorderedListMatch) {
      const listBuffer: string[] = [];
      while (i < lines.length && /^[-*+]\s+(.+)$/.test(lines[i].trim())) {
        listBuffer.push(lines[i].trim().substring(2));
        i++;
      }

      tokens.push({ type: 'unordered_list', items: listBuffer });
      continue;
    }

    // Detect ordered lists
    const orderedListMatch = /^\d+\.\s+(.+)$/.exec(trimmedLine);
    if (orderedListMatch) {
      const listBuffer: string[] = [];
      while (i < lines.length && /^\d+\.\s+(.+)$/.test(lines[i].trim())) {
        listBuffer.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }

      tokens.push({ type: 'ordered_list', items: listBuffer });
      continue;
    }

    // Detect table start
    if (/^\|.*\|$/.test(trimmedLine)) {
      const tableBuffer: string[] = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        tableBuffer.push(lines[i].trim());
        i++;
      }

      tokens.push({ type: 'table', content: tableBuffer.join('\n') });
      continue;
    }

    // Treat the entire line as a paragraph (with inline parsing for links and images)
    const inlineLinkOrImage = trimmedLine.replace(
      /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g,
      (_, alt, src, text, href) =>
        alt && src
          ? `<img alt="${alt}" src="${src}" />`
          : text && href
          ? `<a href="${href}">${text}</a>`
          : ''
    );

    tokens.push({ type: 'paragraph', content: inlineLinkOrImage });
    i++;
  }

  return tokens;
}


  
  
  
  











