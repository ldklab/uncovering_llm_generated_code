// This module transforms JavaScript code by converting arrow functions to regular function expressions,
// while maintaining the original lexical scope of 'this' using .bind(this)

const babylon = require('babylon');
const generate = require('babel-generator').default;
const traverse = require('babel-traverse').default;
const t = require('babel-types');

/**
 * Transforms all arrow functions in the given JavaScript code into regular function expressions.
 * Preserves the lexical `this` of arrow functions by using `.bind(this)`.
 * @param {string} source - The JavaScript code containing arrow functions.
 * @returns {string} - The transformed code with arrow functions replaced.
 */
function transformArrowFunctions(source) {
  // Parse the input JavaScript code into an Abstract Syntax Tree (AST)
  const ast = babylon.parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });

  // Traverse through the AST and transform arrow functions
  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node } = path;

      // Convert the arrow function to a traditional function expression
      const functionExpression = t.functionExpression(
        null,
        node.params,
        node.body,
        false,
        false
      );

      // Replace the arrow function with a call to the function expression bound to `this`
      path.replaceWith(t.callExpression(
        t.memberExpression(functionExpression, t.identifier('bind')),
        [t.thisExpression()]
      ));
    }
  });

  // Generate the transformed JavaScript code from the modified AST
  const output = generate(ast, {}, source);
  return output.code;
}

// Example usage of transformArrowFunctions
const exampleSourceCode = `
const add = (a, b) => a + b;
const square = (x) => {
  return x * x;
};
`;

// Output the transformed source code to the console
console.log(transformArrowFunctions(exampleSourceCode));
