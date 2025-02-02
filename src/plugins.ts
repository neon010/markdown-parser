import hljs from "highlight.js"; 
import { Token } from "./tokenize"; 
import { escapeHtml } from "./utills";

export function syntaxHighlightPlugin(token: Token): string | null {
  console.log(token);
  if (token.content) {
    const language = token.language || "plaintext"; // Default to plaintext if no language is specified

    // Check if the language is supported by highlight.js
    if (hljs.getLanguage(language)) {
      // Highlight the code using highlight.js
      const highlightedCode = hljs.highlight(token.content, { language }).value;

      // Return the highlighted code as HTML
      return `<pre class="hljs"><code class="language-${language}">${highlightedCode}</code></pre>`;
    } else {
      // Fallback for unsupported languages or plaintext
      return `<pre class="hljs"><code>${escapeHtml(token.content)}</code></pre>`;
    }
  }

  return null; // Return null if there's no content
}

/**
 * Table plugin to convert table tokens to HTML
 */
export function tablePlugin(token: Token): string | null {
  if (token.type === "table" && token.content) {
    const rows = token.content
      .trim()
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    if (rows.length < 2) {
      return null;
    }

    const headers = rows[0]
      .split("|")
      .map((header) => header.trim())
      .filter((header) => header !== "")
      .map((header) => `<th>${header}</th>`)
      .join("");

    const body = rows
      .slice(2)
      .map(
        (row) =>
          `<tr>${row
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell !== "")
            .map((cell) => `<td>${cell}</td>`)
            .join("")}</tr>`
      )
      .join("");

    return `<table><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table>`;
  }

  return null;
}

export function inlineStylesPlugin(token: Token): string | null {
  if (
    token.type === "paragraph" &&
    token.content &&
    (/<.*?>/.test(token.content) ||
      /\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|~~.*?~~|`.*?`/.test(token.content))
  ) {
    let content = token.content;
    content = escapeHtml(content);
    content = content.replace(/(\*\*|__)(.*?)\1/g, "<strong>$2</strong>");
    content = content.replace(/(\*|_)(.*?)\1/g, "<em>$2</em>");
    content = content.replace(/~~(.*?)~~/g, "<del>$1</del>");
    content = content.replace(/`(.*?)`/g, "<code>$1</code>");
    return `<p>${content}</p>`;
  }

  return null;
}

export function imagePlugin(token: Token): string | null {
  if (
    token.type === "paragraph" &&
    token.content &&
    /!\[([^\]]*)\]\(([^)]+)\)/.test(token.content)
  ) {
    const res = token.content.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_, altText, src) => `<img src="${src}" alt="${altText || ""}">`
    );
    return `<p>${res}</p>`;
  }
  return null;
}

export function linkPlugin(token: Token): string | null {
  if (
    token.type === "paragraph" &&
    token.content &&
    /\[([^\]]+)\]\(([^)]+)\)/.test(token.content)
  ) {
    const res = token.content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, text, href) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );
    return `<p>${res}</p>`;
  }
  return null;
}
