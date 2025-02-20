// index.js
const babylon = require('babylon');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const t = require('babel-types');

/**
 * Transform arrow functions to regular function expressions and bind 'this'
 * @param {string} source - JavaScript source code containing arrow functions
 * @returns {string} - Transformed source code with arrow functions converted and bound to 'this'
 */
function transformArrowFunctions(source) {
  // Parse the JavaScript source code to an Abstract Syntax Tree (AST)
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });

  // Traverse the AST to find and transform ArrowFunctionExpression nodes
  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node } = path;

      // Create a normal function expression with parameters and body like the arrow function
      const functionExpression = t.functionExpression(
        null,
        node.params, // take parameters from the arrow function
        node.body,   // take the body from the arrow function
        false,
        false
      );

      // Replace the arrow function with an equivalent function expression, while binding it to the current 'this' context
      path.replaceWith(t.callExpression(
        t.memberExpression(functionExpression, t.identifier('bind')),
        [t.thisExpression()] // bind the function to current context
      ));
    }
  });

  // Generate source code from the modified AST
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
