import { MarkdownParser } from "./MarkdownParser";

export class MarkdownStreamer {
  private parser: MarkdownParser;

  constructor() {
    this.parser = new MarkdownParser();
  }

  get transformStream() {
    return new TransformStream({
      transform: (chunk, controller) => {
        const html = this.parser.parseChunk(
          typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk)
        );
        if (html) controller.enqueue(html);
      },
      flush: (controller) => {
        const finalHtml = this.parser.finalize();
        if (finalHtml) controller.enqueue(finalHtml);
      },
    });
  }

  // Alternative node.js stream interface
  nodeStream() {
    return new (require("stream").Transform)({
      transform: (
        chunk: Buffer,
        encoding: string,
        callback: (error?: Error | null, data?: any) => void
      ) => {
        try {
          // console.log("nodeStream chunk", chunk.toString());
          const html: string = this.parser.parseChunk(chunk.toString());

          callback(null, html);
        } catch (err) {
          callback(err as Error);
        }
      },
      flush: (callback: (error?: Error | null, data?: any) => void) => {
        try {
          const finalHtml: string = this.parser.finalize();
          callback(null, finalHtml);
        } catch (err) {
          callback(err as Error);
        }
      },
    });
  }
}
