import fs from 'fs';
import path from 'path';
import { MarkdownParser } from './MarkdownParser';

export interface ProcessOptions {
  /** Process files in subdirectories recursively */
  recursive?: boolean;
  /** Copy non-Markdown files to output directory */
  copyAssets?: boolean;
  /** Custom HTML template wrapper function */
  template?: (html: string, filePath: string) => string;
  /** Custom logger implementation */
  logger?: {
    info?: (message: string) => void;
    error?: (error: Error, message: string) => void;
  };
  /** File extensions to treat as Markdown */
  markdownExtensions?: string[];
}

const defaultOptions: ProcessOptions = {
  recursive: false,
  copyAssets: false,
  markdownExtensions: ['.md'],
};

export async function processMarkdown(
  inputDir: string,
  outputDir: string,
  options?: ProcessOptions
): Promise<void> {
  const mergedOptions: ProcessOptions = { ...defaultOptions, ...options };
  const logger = mergedOptions.logger || {
    info: console.log,
    error: (err, msg) => console.error(msg, err),
  };

  // Validate input directory
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input directory does not exist: ${inputDir}`);
  }

  // Create output directory structure
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Get all files respecting recursive option
  const files = await getFiles(inputDir, mergedOptions.recursive);

  // Process files in parallel with error handling
  await Promise.all(
    files.map(async (filePath) => {
      try {
        const relativePath = path.relative(inputDir, filePath);
        const outputPath = path.join(outputDir, relativePath);
        const outputDirPath = path.dirname(outputPath);

        // Create output directory structure for this file
        await fs.promises.mkdir(outputDirPath, { recursive: true });

        // Check if file is Markdown
        const isMarkdown = mergedOptions.markdownExtensions?.some(ext => 
          filePath.toLowerCase().endsWith(ext.toLowerCase())
        );

        if (isMarkdown) {
          // Process Markdown file
          const markdownContent = await fs.promises.readFile(filePath, 'utf-8');
          const parser = new MarkdownParser();
          const htmlContent = parser.render(markdownContent);
          const finalHtml = mergedOptions.template
            ? mergedOptions.template(htmlContent, filePath)
            : htmlContent;

          // Change extension to .html
          const newPath = outputPath.replace(
            new RegExp(`${path.extname(filePath)}$`), 
            '.html'
          );

          await fs.promises.writeFile(newPath, finalHtml, 'utf-8');
          logger.info?.(`Converted: ${filePath} → ${newPath}`);
        } else if (mergedOptions.copyAssets) {
          // Copy non-Markdown file
          await fs.promises.copyFile(filePath, outputPath);
          logger.info?.(`Copied: ${filePath} → ${outputPath}`);
        }
      } catch (err) {
        logger.error?.(err as Error, `Error processing ${filePath}`);
      }
    })
  );
}

/** Recursively get all files in a directory */
async function getFiles(dir: string, recursive: boolean = true): Promise<string[]> {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return recursive ? getFiles(fullPath, recursive) : [];
        }
        return [fullPath];
      })
    );
    return files.flat();
  } catch (error) {
    return [];
  }
}


