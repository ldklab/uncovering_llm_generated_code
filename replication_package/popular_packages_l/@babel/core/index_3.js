const babel = require('@babel/core');

// Sample modern JavaScript code using async/await
const modernCode = `
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
`;

// Configuration for Babel transformation
const config = {
  presets: ['@babel/preset-env'],
};

// Function to transform modern JavaScript to ES5
function convertToES5(code) {
  babel.transform(code, config, (error, output) => {
    if (error) {
      console.error('Transformation error:', error);
      return;
    }
    console.log('Converted to ES5:', output.code);
  });
}

// Perform the transformation
convertToES5(modernCode);
