const { transformSync } = require('@swc/core');

const jsCode = 'const add = (a, b) => a + b;';

/**
 * Compiles the given JavaScript code using SWC.
 *
 * @param {string} code - The JavaScript source code to be compiled.
 * @returns {string} - The compiled JavaScript code.
 */
function compileCode(code) {
  const options = {
    jsc: {
      parser: {
        syntax: 'ecmascript',
        jsx: false
      },
      target: 'es2015'
    },
    module: {
      type: 'commonjs'
    }
  };

  return transformSync(code, options).code;
}

const compiledCode = compileCode(jsCode);

console.log(compiledCode);
