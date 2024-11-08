// simple-svgo.js
const fs = require('fs');
const { optimize } = require('svgo');

// Command-line argument processing
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node simple-svgo.js <input.svg> <output.svg>');
  process.exit(1);
}

const [inputFile, outputFile] = args;

// SVG optimization and file operations
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
  multipass: true,
  plugins: [
    { name: 'removeViewBox', active: false },
    { name: 'prefixIds', params: { prefix: 'simple-svgo' } }
  ]
};

// Example usage: node simple-svgo.js input.svg output.min.svg
