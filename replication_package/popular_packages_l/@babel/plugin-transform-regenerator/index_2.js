// File: index.js

const babel = require('@babel/core');
const regeneratorPlugin = require('@babel/plugin-transform-regenerator');

// Transforms JavaScript code with async and generator functions into older JS format
function transformAsyncAndGenerators(code) {
  // Using babel to apply the regenerator plugin transformation
  const transformedOutput = babel.transformSync(code, {
    plugins: [regeneratorPlugin],
  });
  // Return the transformed code as a string
  return transformedOutput.code;
}

// Example input code demonstrating async and generator functionality
const exampleCode = `
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

// Transform the example code and output the result
const transformedCodeResult = transformAsyncAndGenerators(exampleCode);
console.log(transformedCodeResult);
