// babel-template-like.js

const acorn = require('acorn');

// Define a template function to parse code strings into AST nodes.
function template(templateStr, placeholders = {}) {
  // Replace placeholders in the template string.
  let filledTemplate = templateStr;
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
    filledTemplate = filledTemplate.replace(placeholder, value);
  }

  // Parse the filled template string into an AST using Acorn.
  const ast = acorn.parse(filledTemplate, { ecmaVersion: 2020 });

  // Return the parsed AST.
  return ast;
}

// Example usage.
const templateString = 'function ${name}() { return ${value}; }';
const placeholders = {
  name: 'myFunction',
  value: '42',
};

const ast = template(templateString, placeholders);
console.log(JSON.stringify(ast, null, 2));

// To use this, you will need to install acorn with the following:
// npm install acorn
