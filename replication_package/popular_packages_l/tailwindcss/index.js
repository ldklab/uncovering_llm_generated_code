// index.js

const fs = require('fs');
const path = require('path');

const utilities = {
  'text-center': 'text-align: center;',
  'font-bold': 'font-weight: bold;',
  'mt-4': 'margin-top: 1rem;',
  'p-2': 'padding: 0.5rem;',
  // Add more utility classes as needed
};

function applyUtilityClasses(classes) {
  const classList = classes.split(' ');
  let styles = '';
  classList.forEach(cls => {
    if (utilities[cls]) {
      styles += utilities[cls];
    }
  });
  return styles;
}

function generateCSS(inputHTML, outputCSS) {
  const regex = /class="([^"]+)"/g;
  let match;
  let styles = '';

  while ((match = regex.exec(inputHTML)) !== null) {
    styles += applyUtilityClasses(match[1]) + '\n';
  }

  fs.writeFileSync(outputCSS, styles);
  console.log(`Generated CSS saved to ${outputCSS}`);
}

function readHTML(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Command-line interface
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node index.js <input.html> <output.css>");
  process.exit(1);
}

const inputHTMLPath = path.resolve(args[0]);
const outputCSSPath = path.resolve(args[1]);

const htmlContent = readHTML(inputHTMLPath);
generateCSS(htmlContent, outputCSSPath);
