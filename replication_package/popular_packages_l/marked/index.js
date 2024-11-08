// index.js

// This package is a simple Node.js application leveraging marked to parse markdown to HTML.

const marked = require('marked');
const fs = require('fs');
const path = require('path');
const DOMPurify = require('dompurify'); // For demonstration, assumes server-side DOMPurify usage
const { JSDOM } = require('jsdom');

// Function to parse markdown file content
function parseMarkdownFile(filePath) {
  // Read markdown from a file
  fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      console.error('Error reading markdown file:', err);
      return;
    }

    // Parse markdown to HTML
    let htmlOutput = marked.parse(data);

    // Create a DOM environment to use DOMPurify
    const window = new JSDOM('').window;
    const sanitize = DOMPurify(window);

    // Sanitize the HTML output
    const cleanHTML = sanitize.sanitize(htmlOutput);
    console.log('Sanitized HTML Output:', cleanHTML);

    // Optionally, write the HTML output to a file
    const outputFilePath = path.join(__dirname, 'output.html');
    fs.writeFile(outputFilePath, cleanHTML, (err) => {
      if (err) {
        console.error('Error writing HTML file:', err);
      } else {
        console.log('HTML file written successfully:', outputFilePath);
      }
    });
  });
}

// Command line interface to process files
const args = process.argv.slice(2);
if (args.length > 0) {
  parseMarkdownFile(args[0]);
} else {
  console.error('Usage: node index.js <markdown-file-path>');
}

// CLI usage: node index.js example.md
// Will parse the example.md file and output sanitized HTML into output.html
```