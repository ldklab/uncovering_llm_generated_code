// index.js

// This script is a simple Node.js application that uses the `marked` package to convert markdown files to sanitized HTML.

const marked = require('marked');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Function to parse markdown file content and convert it to sanitized HTML
function parseMarkdownFile(filePath) {
  // Asynchronously read the markdown file
  fs.readFile(filePath, { encoding: 'utf8' }, (err, data) => {
    if (err) {
      console.error('Error reading markdown file:', err);
      return;
    }

    // Convert markdown to HTML using marked
    let htmlOutput = marked(data);

    // Create a DOM environment for DOMPurify to work
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);

    // Sanitize the generated HTML
    const cleanHTML = DOMPurify.sanitize(htmlOutput);
    console.log('Sanitized HTML Output:', cleanHTML);

    // Write the sanitized HTML to a file
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

// Parse command line arguments to process files
const args = process.argv.slice(2);
if (args.length > 0) {
  parseMarkdownFile(args[0]);
} else {
  console.error('Usage: node index.js <markdown-file-path>');
}

// CLI usage example: node index.js example.md
