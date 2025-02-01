import { processMarkdown } from './processMarkdown';
import path from 'path';

(async () => {
  // With default options
	// await processMarkdown('../mdDir', '../public');

// With custom options
await processMarkdown('../mdDir', '../public', {
  recursive: true,
  copyAssets: true,
  template: (html, filePath) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${path.basename(filePath)}</title>
      </head>
      <body>${html}</body>
    </html>
  `,
  logger: {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (err, msg) => console.error(`[ERROR] ${msg}`, err.stack)
  }
});
})();
