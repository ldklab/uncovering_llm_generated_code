// index.js

const fs = require('fs');
const path = require('path');

// A dictionary mapping utility class names to their corresponding CSS styles
const utilities = {
  'text-center': 'text-align: center;',
  'font-bold': 'font-weight: bold;',
  'mt-4': 'margin-top: 1rem;',
  'p-2': 'padding: 0.5rem;',
  // Additional utility classes can be added here
};

// Function that converts a space-separated list of utility classes into a string of CSS styles
function applyUtilityClasses(classes) {
  return classes.split(' ').map(cls => utilities[cls] || '').join('');
}

// Function that reads an HTML string, extracts class attributes, and generates corresponding CSS styles
function generateCSS(inputHTML, outputCSS) {
  const regex = /class="([^"]+)"/g;
  let match;
  let styles = '';

  // Continuously find matches of class attributes and apply utility classes
  while ((match = regex.exec(inputHTML)) !== null) {
    styles += applyUtilityClasses(match[1]) + '\n';
  }

  // Write the generated styles to the output CSS file
  fs.writeFileSync(outputCSS, styles);
  console.log(`Generated CSS saved to ${outputCSS}`);
}

// Function that reads and returns the content of an HTML file
function readHTML(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Command-line interface handling
const args = process.argv.slice(2);

// Ensure the correct number of command-line arguments are provided
if (args.length < 2) {
  console.error("Usage: node index.js <input.html> <output.css>");
  process.exit(1);
}

// Resolve file paths for input HTML and output CSS files
const inputHTMLPath = path.resolve(args[0]);
const outputCSSPath = path.resolve(args[1]);

// Read the input HTML file and generate the corresponding CSS
const htmlContent = readHTML(inputHTMLPath);
generateCSS(htmlContent, outputCSSPath);
