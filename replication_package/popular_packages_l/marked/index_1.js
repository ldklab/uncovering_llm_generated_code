// index.js

const marked = require('marked');
const fs = require('fs');
const path = require('path');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

function parseMarkdownFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading markdown file:', err);
      return;
    }

    const htmlOutput = marked.parse(data);

    const window = new JSDOM('').window;
    const sanitize = DOMPurify(window);
    const cleanHTML = sanitize.sanitize(htmlOutput);

    console.log('Sanitized HTML Output:', cleanHTML);

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

const args = process.argv.slice(2);
if (args.length > 0) {
  parseMarkdownFile(args[0]);
} else {
  console.error('Usage: node index.js <markdown-file-path>');
}
