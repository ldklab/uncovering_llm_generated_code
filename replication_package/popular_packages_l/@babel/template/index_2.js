const acorn = require('acorn');

// This function takes a template string with placeholders and returns its AST.
function template(templateStr, placeholders = {}) {
  // Substitute placeholders in the template string with their corresponding values.
  let filledTemplate = templateStr;
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
    filledTemplate = filledTemplate.replace(placeholder, value);
  }

  // Convert the filled template into an Abstract Syntax Tree (AST) using Acorn.
  const ast = acorn.parse(filledTemplate, { ecmaVersion: 2020 });

  // Return the generated AST.
  return ast;
}

// Example demonstrating how the template function works.
const templateString = 'function ${name}() { return ${value}; }';
const placeholders = {
  name: 'myFunction',
  value: '42',
};

// Obtain the AST for the function represented by the template string.
const ast = template(templateString, placeholders);
console.log(JSON.stringify(ast, null, 2));

// Ensure acorn is installed using npm before running this code:
// npm install acorn
