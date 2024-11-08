const babel = require("@babel/core");
const syntaxAsyncFunctions = require("@babel/plugin-syntax-async-functions");
const { types: t } = require("@babel/core");

function convertAsyncToGenerator() {
  return {
    inherits: syntaxAsyncFunctions.default,
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

const sampleCode = `
async function fetchData() {
  await fetch('https://example.com');
}

const asyncArrowFunc = async () => {
  await fetch('https://example.com');
}
`;

const transformedOutput = babel.transform(sampleCode, {
  plugins: [convertAsyncToGenerator()]
});

console.log(transformedOutput.code);
