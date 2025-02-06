## A fast and easy to use markdown parser

MarkdownParser is a customizable and extensible JavaScript library for converting Markdown to HTML. It supports plugins for tables, images, links, inline styles, and syntax highlighting, allowing you to extend its functionality with ease.

## Installation

```
npm i md-parser-pro
```

## browser Usage

```js
import { MarkdownParser } from "md-parser-pro";

// Create a new instance of MarkdownParser
const parser = new MarkdownParser();

// Render Markdown to HTML
const markdown = `
# Hello World

This is a **bold** text and an [example link](https://example.com).

\`\`\`javascript
console.log('Hello, MarkdownParser!');
\`\`\`
`;

const html = parser.enableSyntaxHighlighting(true).render(markdown);
console.log(html);
```
if you are enabling syntax higlighting, then you must add highlight.js css plugin while rendering parsed html 

## Node.js Example
```js
const { MarkdownParser } = require("md-parser-pro/node");

// Create a new instance of MarkdownParser
const parser = new MarkdownParser();

// Sample Markdown input
const markdown = `
# Node.js Example

- **MarkdownParser** converts Markdown to HTML.
- Supports tables, images, links, and more.

\`\`\`javascript
console.log('Code block with syntax highlighting');
\`\`\`
`;

// Render Markdown to HTML with syntax highlighting enabled
const html = parser.enableSyntaxHighlighting(true).render(markdown);

// Output the result
console.log("Generated HTML:\n", html);
```

## processMarkdown

`processMarkdown` is a Node.js utility for converting Markdown files to HTML. It recursively processes files in a directory, converts Markdown to HTML using the MarkdownParser, and saves the output to a specified directory. It also supports custom templates, asset copying, and flexible logging.

```js
const { processMarkdown } = require("md-parser-pro/node");

(async () => {
  try {
    await processMarkdown('./markdown-files', './output', {
      recursive: true,
      copyAssets: true,
      template: (html, filePath) => `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>${filePath}</title>
          </head>
          <body>${html}</body>
        </html>
      `,
      logger: {
        info: (message) => console.log(`[INFO]: ${message}`),
        error: (err, message) => console.error(`[ERROR]: ${message}`, err),
      },
      markdownExtensions: ['.md', '.markdown'],
    });
  } catch (error) {
    console.error('Error processing markdown:', error);
  }
})();
```

Function Signature 

```js
async function processMarkdown(
  inputDir: string,
  outputDir: string,
  options?: ProcessOptions
): Promise<void>
```

## Parameters:
- inputDir: string
Path to the input directory containing Markdown files.

- outputDir: string
Path to the output directory where converted files will be saved.

- options?: ProcessOptions
Optional configuration object for controlling the behavior of the function.


## ProcessOptions


## Basic Conversion
```js
await processMarkdown('./docs', './public', {
  recursive: true,
});
```
Using a Custom Template
```
await processMarkdown('./content', './dist', {
  template: (html, filePath) => `
    <!DOCTYPE html>
    <html>
      <head><title>Document: ${path.basename(filePath)}</title></head>
      <body>${html}</body>
    </html>
  `,
});
```
Copying Assets
```
await processMarkdown('./website', './build', {
  copyAssets: true,
});
```

## API Reference

1. constructor()
Creates a new MarkdownParser instance.

```js
const parser = new MarkdownParser();
```

2 use(plugin: (token: Token) => string | null): this

Registers a custom plugin.

```js
parser.use(customPlugin);
```
plugin: A function that takes a Token and returns an HTML string or null.

3. enableSyntaxHighlighting(enable: boolean): this
Enables or disables syntax highlighting for code blocks.

```js
parser.enableSyntaxHighlighting(true);
```
enable: A boolean indicating whether to enable (true) or disable (false) syntax highlighting.

4. render(input: string): string

Parses the given Markdown string and returns HTML.

```js
const html = parser.render(markdown);
```
- input: The Markdown string to be converted to HTML.
- Returns: A string containing the rendered HTML.