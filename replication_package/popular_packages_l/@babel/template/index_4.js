// babel-template-like.js

const acorn = require('acorn');

// Define a function that replaces placeholders in a code string, parses it into an AST.
function parseTemplateString(templateStr, placeholders = {}) {
  // Substitute placeholders within the provided template string with respective values.
  let processedTemplate = templateStr;

  for (const [key, value] of Object.entries(placeholders)) {
    const placeholderPattern = new RegExp(`\\$\\{${key}\\}`, 'g');
    processedTemplate = processedTemplate.replace(placeholderPattern, value);
  }

  // Parse the processed template string to an AST using Acorn with ECMAScript 2020.
  const abstractSyntaxTree = acorn.parse(processedTemplate, { ecmaVersion: 2020 });

  // Return the generated Abstract Syntax Tree.
  return abstractSyntaxTree;
}

// Demonstrate function usage with a sample template and placeholders.
const exampleTemplate = 'function ${name}() { return ${value}; }';
const examplePlaceholders = {
  name: 'myFunction',
  value: '42',
};

// Parse the template into an AST and output the result.
const generatedAST = parseTemplateString(exampleTemplate, examplePlaceholders);
console.log(JSON.stringify(generatedAST, null, 2));

// Note: Ensure 'acorn' is installed before using this script by running:
// npm install acorn
