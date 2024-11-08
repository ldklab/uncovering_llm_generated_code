// simple-svgo.js
const fs = require('fs');
const { optimize } = require('svgo');

// Extract command-line arguments
const [inputFile, outputFile] = process.argv.slice(2);

// Validate the number of arguments
if (!inputFile || !outputFile) {
  console.error('Usage: node simple-svgo.js <input.svg> <output.svg>');
  process.exit(1);
}

// Function to handle file operations and optimization
function optimizeSvg(inputPath, outputPath) {
  fs.readFile(inputPath, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(`Error reading file ${inputPath}: ${readErr.message}`);
      process.exit(1);
    }

    // Optimize SVG data
    const result = optimize(data, {
      path: inputPath,
      multipass: true,
      plugins: ['preset-default'], // Default optimization plugins
    });

    // Write optimized data to output file
    fs.writeFile(outputPath, result.data, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file ${outputPath}: ${writeErr.message}`);
        process.exit(1);
      }

      console.log(`Optimized SVG saved to ${outputPath}`);
    });
  });
}

// Invoke the optimization function with specified files
optimizeSvg(inputFile, outputFile);

// Example SVGO configuration (svgo.config.js)
// module.exports = {
//   multipass: true,
//   plugins: [
//     { name: 'removeViewBox', active: false },
//     { name: 'prefixIds', params: { prefix: 'simple-svgo' } },
//   ],
// };
