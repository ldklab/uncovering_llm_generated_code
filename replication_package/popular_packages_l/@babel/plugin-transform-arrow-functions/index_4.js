// index.js
const babylon = require('babylon');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const t = require('babel-types');

/**
 * Transform arrow functions to regular function expressions
 * @param {string} source - JavaScript source code containing arrow functions
 * @returns {string} - Transformed source code with arrow functions converted to functions
 */
function transformArrowFunctions(source) {
  // Parse the source code into AST
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });

  // Traverse the AST
  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node } = path;

      // Create a function expression replacing arrow function
      const functionExpression = t.functionExpression(
        null,                   // Function name
        node.params,            // Parameters of the arrow function
        node.body,              // Body of the arrow function
        node.generator,         // Mark as generator function
        node.async              // Mark as async function
      );

      // Replace arrow function with function expression bound to 'this'
      path.replaceWith(
        t.callExpression(
          t.memberExpression(functionExpression, t.identifier('bind')),
          [t.thisExpression()]
        )
      );
    }
  });

  // Generate the transformed code back from the AST
  const output = generate(ast, {}, source);
  return output.code;
}

// Usage Example
const exampleSourceCode = `
const add = (a, b) => a + b;
const square = (x) => {
  return x * x;
};
`;

console.log(transformArrowFunctions(exampleSourceCode));
