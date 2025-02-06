import { Token } from "./tokenize";
import { escapeHtml } from "./utills";

/**
 * Parses tokens into formatted HTML
 */
export function parse(
  tokens: Token[],
  plugins: Array<(token: Token) => string | null> = [],
  indentation: number = 0
): string {
  const indent = (level: number) => "  ".repeat(level); // 2 spaces for indentation

  return tokens
    .map((token) => {
      let result: string | null = null;

      // Allow plugins to process the token
      for (const plugin of plugins) {
        result = plugin(token);
        if (result !== null) return `${indent(indentation)}${result}\n`;
      }

      // Default rendering logic with indentation
      switch (token.type) {
        case "heading":
          result = renderHeading(token);
          break;
        case "paragraph":
          result = renderParagraph(token);
          break;
        case "unordered_list":
          result = renderUnorderedList(token);
          break;
        case "ordered_list":
          result = renderOrderedList(token);
          break;
        case "blockquote":
          result = renderBlockquote(token);
          break;
        case "table":
          result = renderTable(token);
          break;
        case "image":
          result = renderImage(token);
          break;
        case "link":
          result = renderLink(token);
          break;
        case "code_block":
          result = renderCodeBlock(token);
          break;
        case "horizontal_rule":
          result = renderHorizontalRule();
          break;
        default:
          result = ""; // Fallback for unhandled token types
      }

      return result ? `${indent(indentation)}${result}\n` : "";
    })
    .join("");
}



function renderHeading(token: Token): string {
  if (token.content && token.level) {
    return `<h${token.level}>${token.content}</h${token.level}>`;
  }
  return "";
}

function renderParagraph(token: Token): string {
  if (token.content) {
    const content = token.content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)/g,
      (_, alt, src, text, href) =>
        alt && src
          ? `<img alt="${escapeHtml(alt)}" src="${escapeHtml(src)}" />`
          : text && href
            ? `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`
            : ""
    );
    return `<p>${content}</p>`.trim();
  }
  return "";
}

function renderUnorderedList(token: Token): string {
  if (token.items && Array.isArray(token.items)) {
    const listItems = token.items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("\n  ");
    return `
<ul>
  ${listItems}
</ul>`.trim();
  }
  return "";
}

function renderOrderedList(token: Token): string {
  if (token.items && Array.isArray(token.items)) {
    const listItems = token.items
      .map((item) => `      <li>${escapeHtml(item)}</li>`)
      .join("\n");
    return `
<ol>
${listItems}
    </ol>`.trim();
  }
  return "";
}


function renderBlockquote(token: Token): string {
  if (token.content) {
    const content = token.content
      .split("\n") // Split blockquote into individual lines
      .map((line) => `<p>${escapeHtml(line)}</p>`) // Wrap each line in a paragraph and escape HTML
      .join("\n  "); // Join lines with indentation for readability
    return `
<blockquote>
  ${content}
</blockquote>`.trim();
  }
  return "";
}


function renderTable(token: Token): string {
  if (token.content) {
    const rows = token.content.trim().split("\n");

    // Render headers
    const headers = rows[0]
      .split("|")
      .filter((header) => header.trim() !== "")
      .map((header) => `<th>${escapeHtml(header.trim())}</th>`)
      .join("\n  "); // Added newline for readability

    // Render body
    const body = rows
      .slice(1) // Skip the header row
      .map(
        (row) => `
  <tr>
    ${row
      .split("|")
      .filter((cell) => cell.trim() !== "")
      .map((cell) => `<td>${escapeHtml(cell.trim())}</td>`)
      .join("\n    ")} <!-- Added indentation for readability -->
  </tr>`
      )
      .join("\n");

    return `
<table>
  <thead>
    <tr>
      ${headers}
    </tr>
  </thead>
  <tbody>
    ${body}
  </tbody>
</table>`.trim(); // Trim the output to remove unnecessary newlines
  }
  return "";
}


function renderImage(token: Token): string {
  if (token.src) {
    const altText = token.alt || ""; // Use empty alt text if undefined
    return `<img src="${escapeHtml(token.src)}" alt="${escapeHtml(altText)}" />`;
  }
  return "";
}

function renderLink(token: Token): string {
  if (token.href && token.text) {
    return `<a href="${escapeHtml(token.href)}">${escapeHtml(token.text)}</a>`;
  }
  return "";
}

function renderCodeBlock(token: Token): string {
  if (token.content) {
    // Ensure the code content is escaped and properly indented for readability
    const content = escapeHtml(token.content)
return `<pre>
  <code>
${content}
  </code>
</pre>`;
  }
  return "";
}

// Add this new renderer function
function renderHorizontalRule(): string {
  return "<hr />"; // Self-closing <hr> tag for proper HTML5
}



