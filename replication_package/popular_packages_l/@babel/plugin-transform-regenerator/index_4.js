// File: index.js

const babel = require('@babel/core');
const regenerator = require('@babel/plugin-transform-regenerator');

// A function to transform async/generator functions code
function transformAsyncGenerator(code) {
  const output = babel.transformSync(code, {
    plugins: [regenerator],
  });
  return output.code;
}

// Example usage
const inputCode = `
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

const transformedCode = transformAsyncGenerator(inputCode);
console.log(transformedCode);
