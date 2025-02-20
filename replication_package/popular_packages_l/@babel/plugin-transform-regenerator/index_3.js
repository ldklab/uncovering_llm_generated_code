// File: index.js

const babel = require('@babel/core');
const regeneratorPlugin = require('@babel/plugin-transform-regenerator');

// This function transforms input code containing async functions or generators
// into a format that can be run on environments that do not support them natively.
function transformCodeWithRegenerator(inputSourceCode) {
  const transformedOutput = babel.transformSync(inputSourceCode, {
    plugins: [regeneratorPlugin],
  });
  return transformedOutput.code;
}

// Example input code with async function and generator
const originalCode = `
  async function fetchData() {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  }

  function* counter() {
    let i = 0;
    while (true) {
      yield i++;
    }
  }
`;

// Transform the input code
const processedCode = transformCodeWithRegenerator(originalCode);
console.log(processedCode);
