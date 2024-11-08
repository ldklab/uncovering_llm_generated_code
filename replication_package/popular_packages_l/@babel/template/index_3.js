// Import the Acorn library for JavaScript parsing 
const acorn = require('acorn');

// The template function converts a template string with placeholders into an AST.
function template(templateStr, placeholders = {}) {
  // Substitute each placeholder in the template string with its corresponding value.
  let filledTemplate = templateStr;
  for (const [key, value] of Object.entries(placeholders)) {
    // Create a regex for matching the placeholder format.
    const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
    // Replace the placeholder with the actual value.
    filledTemplate = filledTemplate.replace(placeholder, value);
  }

  // Use Acorn to parse the substituted template string into an AST.
  const ast = acorn.parse(filledTemplate, { ecmaVersion: 2020 });

  // Output the AST representation.
  return ast;
}

// Demonstrate the template function by parsing a function definition.
const templateString = 'function ${name}() { return ${value}; }';

// Provide the actual values to replace the placeholders in the template string.
const placeholders = {
  name: 'myFunction',
  value: '42',
};

// Get the AST by passing the template string and placeholders to the template function.
const ast = template(templateString, placeholders);

// Print the AST with formatted JSON for readability.
console.log(JSON.stringify(ast, null, 2));

// Note: Ensure Acorn is installed with the command 'npm install acorn' for this to work.
