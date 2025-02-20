// index.js

const fs = require('fs');
const path = require('path');

// Define utility classes with their corresponding CSS styles
const utilityClasses = {
  'text-center': 'text-align: center;',
  'font-bold': 'font-weight: bold;',
  'mt-4': 'margin-top: 1rem;',
  'p-2': 'padding: 0.5rem;',
  // More utility classes can be added here
};

// Function to convert utility class names to CSS styles
function convertClassesToStyles(classes) {
  return classes.split(' ').map(cls => utilityClasses[cls] || '').join(' ');
}

// Function to generate CSS from an input HTML content
function generateCSSFromHTML(htmlContent, cssOutputPath) {
  const classAttributeRegex = /class="([^"]+)"/g;
  let styles = '';
  let match;

  while ((match = classAttributeRegex.exec(htmlContent)) !== null) {
    styles += convertClassesToStyles(match[1]) + '\n';
  }

  fs.writeFileSync(cssOutputPath, styles);
  console.log(`CSS has been generated and saved to ${cssOutputPath}`);
}

// Function to read HTML file content
function readHTMLFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

// Main Execution: Command-line interface logic
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: node index.js <input.html> <output.css>");
  process.exit(1);
}

const inputHTMLFilePath = path.resolve(args[0]);
const outputCSSFilePath = path.resolve(args[1]);

const htmlContent = readHTMLFile(inputHTMLFilePath);
generateCSSFromHTML(htmlContent, outputCSSFilePath);
