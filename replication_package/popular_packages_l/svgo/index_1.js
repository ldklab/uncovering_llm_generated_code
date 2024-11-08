// simple-svgo.js
const fs = require('fs');
const { optimize } = require('svgo');

// Process command-line arguments
const [inputFile, outputFile] = process.argv.slice(2);

if (!inputFile || !outputFile) {
  console.error('Usage: node simple-svgo.js <input.svg> <output.svg>');
  process.exit(1);
}

// Function to read, optimize, and write SVG
function optimizeSvg(inputFilePath, outputFilePath) {
  fs.readFile(inputFilePath, 'utf8', (err, svgData) => {
    if (err) {
      console.error(`Error reading file ${inputFilePath}: ${err.message}`);
      return process.exit(1);
    }

    const optimizedResult = optimize(svgData, {
      path: inputFilePath,
      multipass: true,
      plugins: ['preset-default']
    });

    fs.writeFile(outputFilePath, optimizedResult.data, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${outputFilePath}: ${err.message}`);
        return process.exit(1);
      }

      console.log(`Optimized SVG saved to ${outputFilePath}`);
    });
  });
}

// Run SVG optimization
optimizeSvg(inputFile, outputFile);

// svgo.config.js
module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'removeViewBox',
      active: false
    },
    {
      name: 'prefixIds',
      params: { prefix: 'simple-svgo' }
    }
  ]
};
