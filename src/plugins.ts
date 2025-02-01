import hljs from "highlight.js"; // Import highlight.js

import { Token } from "./tokenize"; // Assuming you still use the Token type

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



export function escapeHtml(str: string): string {
    const entityMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
    };
    return str.replace(/[<>&"']/g, (match) => entityMap[match]);
}