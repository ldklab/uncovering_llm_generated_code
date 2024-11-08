const acorn = require('acorn');

// The 'template' function converts code templates with placeholders into AST nodes.
function template(templateStr, placeholders = {}) {
  // Replace each placeholder in the template string with its corresponding value.
  let filledTemplate = templateStr;
  for (const [key, value] of Object.entries(placeholders)) {
    const placeholderRegex = new RegExp(`\\$\\{${key}\\}`, 'g'); // Create a dynamic regex to find placeholders.
    filledTemplate = filledTemplate.replace(placeholderRegex, value); // Replace them with actual values.
  }

  // Use Acorn to parse the filled-in template string and convert it to an AST.
  const ast = acorn.parse(filledTemplate, { ecmaVersion: 2020 });

  // Return the resulting AST.
  return ast;
}

// Example code demonstrating how the 'template' function is called.
const templateStr = 'function ${name}() { return ${value}; }';
const placeholderValues = {
  name: 'myFunction',
  value: '42',
};

// Generate and log the AST by applying the template and placeholders.
const astOutput = template(templateStr, placeholderValues);
console.log(JSON.stringify(astOutput, null, 2));

// Note: To execute this script, install "acorn" with this command:
// npm install acorn
