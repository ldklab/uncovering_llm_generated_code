const babel = require('@babel/core');

// Sample ES6+ code using async/await to be transformed
const asyncCode = `
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
`;

// Babel configuration to specify plugins/presets for transformation
const babelOptions = {
  presets: ['@babel/preset-env'], // Use the env preset to transform modern JavaScript into ES5
};

// Function to transform code
function transformCode(code) {
  babel.transform(code, babelOptions, (err, result) => {
    if (err) {
      console.error('Error transforming code:', err);
      return;
    }
    console.log('Transformed code:', result.code);
  });
}

// Execute the transformation
transformCode(asyncCode);
