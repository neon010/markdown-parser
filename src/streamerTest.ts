import {MarkdownStreamer} from './StreamingMarkdownParser';


// Test content
const testContent = [
  "# Hello\n",
  "World\n",
  "```js\nconsole.log('test')\n```\n",
  "**Bold** text\n"
];

// Create streamer and stream
const streamer = new MarkdownStreamer();
const markdownStream = streamer.nodeStream();
let output = '';
// Configure output handling
markdownStream.on('data', (chunk: any) => {
  // Convert Buffer to string if needed
  output += chunk instanceof Buffer ? chunk.toString('utf8') : chunk;
//   console.log('Received chunk:', JSON.stringify(output));
});

markdownStream.on('end', () => {
  console.log('Final output completed');
});

markdownStream.on('error', (err: any) => {
  console.error('Stream error:', err);
});

// Simulate chunked input with delays
let chunkIndex = 0;

function sendChunk() {
  if (chunkIndex < testContent.length) {
    const chunk = testContent[chunkIndex];
    console.log('\nSending chunk:', JSON.stringify(chunk));
    
    markdownStream.write(chunk, 'utf8', (err: any) => {
      if (err) return console.error('Write error:', err);
      chunkIndex++;
      setTimeout(sendChunk, 500);
    });
  } else {
    markdownStream.end(() => {
      console.log('Finished sending input');
    });
  }
}

// Start test
sendChunk();