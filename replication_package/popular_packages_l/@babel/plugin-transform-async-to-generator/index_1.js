const babel = require("@babel/core");
const syntaxAsyncFunctions = require("@babel/plugin-syntax-async-functions");
const { types: t } = require("@babel/core");

function asyncToGenerator() {
  return {
    inherits: syntaxAsyncFunctions.default,
    visitor: {
      FunctionDeclaration(path) {
        if (!path.node.async) return;

        const asyncFunction = path.node;
        const generatorFunction = t.functionDeclaration(
          asyncFunction.id,
          asyncFunction.params,
          asyncFunction.body,
          true // to indicate it's a generator
        );
        
        path.replaceWith(generatorFunction);
      },
      FunctionExpression(path) {
        if (!path.node.async) return;

        const asyncFunction = path.node;
        const generatorFunction = t.functionExpression(
          asyncFunction.id,
          asyncFunction.params,
          asyncFunction.body,
          true // to indicate it's a generator
        );
        
        path.replaceWith(generatorFunction);
      },
      ArrowFunctionExpression(path) {
        if (!path.node.async) return;

        const asyncFunction = path.node;
        const generatorFunction = t.arrowFunctionExpression(
          asyncFunction.params,
          asyncFunction.body,
          true // to indicate it's a generator
        );
        
        path.replaceWith(generatorFunction);
      }
    }
  };
}

const code = `
async function fetchData() {
  await fetch('https://example.com');
}

const asyncArrowFunction = async () => {
  await fetch('https://example.com');
}
`;

const output = babel.transform(code, {
  plugins: [asyncToGenerator()]
});

console.log(output.code);
