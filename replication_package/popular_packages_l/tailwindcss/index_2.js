// index.js

const fs = require('fs');
const path = require('path');

// Define utility classes and their corresponding styles
const utilityClasses = {
  'text-center': 'text-align: center;',
  'font-bold': 'font-weight: bold;',
  'mt-4': 'margin-top: 1rem;',
  'p-2': 'padding: 0.5rem;',
  // Additional utility classes can be added here
};

// Convert a string of utility class names to a CSS style string
function convertClassesToStyles(classNames) {
  return classNames.split(' ').map(className => utilityClasses[className] || '').join(' ');
}

// Generate CSS from HTML by finding utility classes and converting them to CSS styles
function generateCSSFromFile(htmlFilePath, cssOutputPath) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
  const classRegex = /class="([^"]+)"/g;
  let match;
  let accumulatedStyles = '';

  // Iterate over each class attribute match
  while ((match = classRegex.exec(htmlContent)) !== null) {
    const styles = convertClassesToStyles(match[1]);
    if (styles) {
      accumulatedStyles += styles + '\n';
    }
  }

  fs.writeFileSync(cssOutputPath, accumulatedStyles);
  console.log(`Generated CSS saved to ${cssOutputPath}`);
}

// Command-line interface functionality
const [inputHTMLPath, outputCSSPath] = process.argv.slice(2);

if (!inputHTMLPath || !outputCSSPath) {
  console.error("Usage: node index.js <input.html> <output.css>");
  process.exit(1);
}

// Resolve file paths and generate CSS
generateCSSFromFile(path.resolve(inputHTMLPath), path.resolve(outputCSSPath));
