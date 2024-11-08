// index.js

// This script is a simple Node.js application that parses Markdown files to HTML using 'marked'
// and sanitizes the HTML using 'DOMPurify' through a JSDOM environment.

const marked = require('marked');
const fs = require('fs');
const path = require('path');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Function to convert markdown to sanitized HTML
function convertMarkdownToHTML(filePath) {
  // Reading the markdown file asynchronously
  fs.readFile(filePath, 'utf8', (error, markdownData) => {
    if (error) {
      console.error('Failed to read markdown file:', error);
      return;
    }

    // Convert markdown data to HTML
    const rawHTML = marked.parse(markdownData);

    // Set up a DOM window for DOMPurify to sanitize HTML
    const jsdomWindow = new JSDOM('').window;
    const domPurifyInstance = DOMPurify(jsdomWindow);

    // Sanitize the HTML
    const sanitizedHTML = domPurifyInstance.sanitize(rawHTML);
    
    // Output sanitized HTML to console
    console.log('Sanitized HTML Content:', sanitizedHTML);

    // Define output path for the HTML file
    const htmlOutputPath = path.join(__dirname, 'output.html');

    // Write the sanitized HTML to a file
    fs.writeFile(htmlOutputPath, sanitizedHTML, (error) => {
      if (error) {
        console.error('Error writing HTML file:', error);
      } else {
        console.log('Sanitized HTML saved to:', htmlOutputPath);
      }
    });
  });
}

// Parse command line arguments to process markdown files
const userArgs = process.argv.slice(2);
if (userArgs.length > 0) {
  convertMarkdownToHTML(userArgs[0]); // Process the first argument as file path
} else {
  console.error('Usage: node index.js <path-to-markdown-file>');
}

// CLI usage example: node index.js example.md
// The above command parses 'example.md' and writes sanitized HTML to 'output.html'.
