// import Prism from "prismjs";
// // Import necessary Prism components and languages
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-css";
// import "prismjs/themes/prism.css";
// import { Token } from "./tokenize";

// export function syntaxHighlightPlugin(token: Token): string {
//     // if (token.content) {
//     //     const language = token.language || "plaintext"; // Default to plaintext if no language is specified
//     //     const grammar = Prism.languages[language];
//     //     const highlightedCode = grammar
//     //       ? Prism.highlight(token.content, grammar, language)
//     //       : escapeHtml(token.content); // Fallback to escaping HTML if the language is not supported
    
//     //     return `<pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>`;
//     //   }
//     console.log(token);
//       return token.content ? token.content : "";
// }


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