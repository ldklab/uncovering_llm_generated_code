// index.js

const fs = require('fs');
const path = require('path');

// Dictionary mapping utility class names to their corresponding CSS style rules
const utilities = {
  'text-center': 'text-align: center;',
  'font-bold': 'font-weight: bold;',
  'mt-4': 'margin-top: 1rem;',
  'p-2': 'padding: 0.5rem;',
  // Additional utility classes can be added here
};

// Function to apply utility classes by converting class names to their respective CSS styles
function applyUtilityClasses(classes) {
  const classList = classes.split(' ');
  return classList.reduce((styles, cls) => styles + (utilities[cls] || ''), '');
}

// Function to generate a CSS file based on the class attributes found in the provided HTML
function generateCSS(inputHTML, outputCSSPath) {
  const classRegex = /class="([^"]+)"/g;
  let match;
  let styles = '';

  while ((match = classRegex.exec(inputHTML)) !== null) {
    styles += applyUtilityClasses(match[1]) + '\n';
  }

  fs.writeFileSync(outputCSSPath, styles);
  console.log(`Generated CSS saved to ${outputCSSPath}`);
}

// Function to read the content of an HTML file from the specified path
function readHTML(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Command-line interface handling
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node index.js <input.html> <output.css>");
  process.exit(1);
}

const inputHTMLPath = path.resolve(args[0]);
const outputCSSPath = path.resolve(args[1]);

// Process the specified input HTML file to generate the CSS file
const htmlContent = readHTML(inputHTMLPath);
generateCSS(htmlContent, outputCSSPath);
