const babel = require('@babel/core');

// Async function sample code to be transpiled
const sampleAsyncCode = `
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
`;

// Babel configuration object indicating the use of the `env` preset
const babelConfig = {
  presets: ['@babel/preset-env'],
};

// Function to carry out the transformation
function transpileCode(jsCode) {
  babel.transform(jsCode, babelConfig, (error, outcome) => {
    if (error) {
      console.error('Error during transformation:', error);
    } else {
      console.log('Transpiled code:', outcome.code);
    }
  });
}

// Perform the transpilation of the sample code
transpileCode(sampleAsyncCode);
