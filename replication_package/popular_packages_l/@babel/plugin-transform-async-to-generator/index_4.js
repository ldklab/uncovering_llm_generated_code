const babel = require("@babel/core");
const syntaxAsyncFunctions = require("@babel/plugin-syntax-async-functions");
const { types: t } = require("@babel/core");

// Custom Babel plugin to transform async functions to generator functions
function asyncToGenerator() {
  return {
    inherits: syntaxAsyncFunctions.default,
    visitor: {
      FunctionDeclaration(path) {
        if (!path.node.async) return; // Check if the function is async

        const asyncFunction = path.node;
        // Create a generator function from the async function
        const generatorFunction = t.functionDeclaration(
          asyncFunction.id,
          asyncFunction.params,
          asyncFunction.body,
          true // To indicate it's a generator
        );
        
        // Replace the original async function with a new generator function
        path.replaceWith(generatorFunction);
      },
      FunctionExpression(path) {
        if (!path.node.async) return; // Check if the function is async

        const asyncFunction = path.node;
        // Create a generator function from the async function
        const generatorFunction = t.functionExpression(
          asyncFunction.id,
          asyncFunction.params,
          asyncFunction.body,
          true // To indicate it's a generator
        );
        
        // Replace the original async function with a new generator function
        path.replaceWith(generatorFunction);
      },
      ArrowFunctionExpression(path) {
        if (!path.node.async) return; // Check if the function is async

        const asyncFunction = path.node;
        // Create a generator function from the async function
        const generatorFunction = t.arrowFunctionExpression(
          asyncFunction.params,
          asyncFunction.body,
          true // To indicate it's a generator
        );
        
        // Replace the original async function with a new generator function
        path.replaceWith(generatorFunction);
      }
    }
  };
}

// Example usage of the custom Babel plugin
const code = `
async function fetchData() {
  await fetch('https://example.com');
}

const asyncArrowFunction = async () => {
  await fetch('https://example.com');
}
`;

// Transform the code by applying the asyncToGenerator plugin
const output = babel.transform(code, {
  plugins: [asyncToGenerator()]
});

// Print the transformed code
console.log(output.code);
