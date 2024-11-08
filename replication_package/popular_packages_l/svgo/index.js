// simple-svgo.js
const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

// Basic command-line interface to process SVG files
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node simple-svgo.js <input.svg> <output.svg>');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

// Read and optimize an SVG file
fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file ${inputFile}: ${err}`);
    process.exit(1);
  }

  const result = optimize(data, {
    path: inputFile,
    multipass: true,
    plugins: ['preset-default']
  });

  fs.writeFile(outputFile, result.data, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${outputFile}: ${err}`);
      process.exit(1);
    }

    console.log(`Optimized SVG saved to ${outputFile}`);
  });
});

// Example configuration file (svgo.config.js)

module.exports = {
  multipass: true, // optimize with multiple passes
  plugins: [
    {
      name: 'removeViewBox',
      active: false // keep the viewBox attribute
    },
    {
      name: 'prefixIds',
      params: {
        prefix: 'simple-svgo'
      }
    }
  ]
};

// Example: Run by calling `node simple-svgo.js input.svg output.min.svg`
// This script reads the input SVG, optimizes it using SVGO, and writes
// the optimized SVG to the output file specified.
