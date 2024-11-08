const babel = require("@babel/core");
const { default: syntaxAsyncFunctions } = require("@babel/plugin-syntax-async-functions");
const { types: t } = require("@babel/core");

function asyncToGenerator() {
  return {
    inherits: syntaxAsyncFunctions,
    visitor: {
      FunctionDeclaration(path) {
        if (!path.node.async) return;
        const { id, params, body } = path.node;
        const generatorFunc = t.functionDeclaration(id, params, body, true);
        path.replaceWith(generatorFunc);
      },
      FunctionExpression(path) {
        if (!path.node.async) return;
        const { id, params, body } = path.node;
        const generatorFunc = t.functionExpression(id, params, body, true);
        path.replaceWith(generatorFunc);
      },
      ArrowFunctionExpression(path) {
        if (!path.node.async) return;
        const { params, body } = path.node;
        const generatorFunc = t.arrowFunctionExpression(params, body, true);
        path.replaceWith(generatorFunc);
      }
    }
  };
}

const codeSample = `
async function fetchData() {
  await fetch('https://example.com');
}

const asyncArrowFunction = async () => {
  await fetch('https://example.com');
}
`;

const transformedCode = babel.transform(codeSample, {
  plugins: [asyncToGenerator()]
});

console.log(transformedCode.code);
