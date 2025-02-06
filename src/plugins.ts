import { Token } from "./tokenize";
import { escapeHtml } from "./utills";

let hljs: any;

if (typeof window !== "undefined") {
  // Browser environment
  hljs = require("highlight.js/lib/core"); // Tree-shake for smaller bundle size
  hljs.registerLanguage(
    "javascript",
    require("highlight.js/lib/languages/javascript")
  );
  hljs.registerLanguage("python", require("highlight.js/lib/languages/python"));
  hljs.registerLanguage("java", require("highlight.js/lib/languages/java"));
} else {
  // Node.js environment
  hljs = require("highlight.js");
}

export function syntaxHighlightPlugin(token: Token): string | null {
  if (token.type === "code_block" && token.content) {
    const language = token.language || "plaintext"; // Default to plaintext if no language is specified

    // Check if the language is supported by highlight.js
    if (hljs.getLanguage(language)) {
      const highlightedCode = hljs.highlight(token.content, { language }).value;

      // Return the highlighted code as formatted HTML with indentation and line breaks
      return `
<pre class="hljs">
  <code class="language-${language}">
    ${highlightedCode}
  </code>
</pre>`.trim();
    } else {
      // Fallback for unsupported languages or plaintext
      return `
<pre class="hljs">
  <code>${escapeHtml(token.content)}</code>
</pre>`.trim();
    }
  }

  return null; // Return null if the token is not a code block or has no content
}

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
      .map((header) => `      <th>${header}</th>`) // Indent headers
      .join("\n");

    const body = rows
      .slice(2)
      .map((row) => {
        const cells = row
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell !== "")
          .map((cell) => `      <td>${cell}</td>`) // Indent cells
          .join("\n");
        return `    <tr>\n${cells}\n    </tr>`; // Format row with indentation
      })
      .join("\n");

    return `<table>
  <thead>
    <tr>
${headers}
    </tr>
  </thead>
  <tbody>
${body}
  </tbody>
</table>`;
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
