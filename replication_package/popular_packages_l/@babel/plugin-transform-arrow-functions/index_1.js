// index.js
const { parse } = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

/**
 * Transform arrow functions to regular function expressions
 * @param {string} source - JavaScript source code containing arrow functions
 * @returns {string} - Transformed source code with arrow functions converted to functions
 */
function transformArrowFunctions(source) {
  // Parse the source code into AST
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });

  // Traverse the AST
  traverse(ast, {
    ArrowFunctionExpression(path) {
      const { node } = path;

      // Create a function expression with the same parameters and body
      const functionExpression = t.functionExpression(
        null,
        node.params,
        node.body,
        false, // Not a generator
        false  // Not an async function
      );

      // Preserve arrow function's lexical 'this'
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
