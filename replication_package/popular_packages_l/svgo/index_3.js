// simple-svgo.js
const fs = require('fs');
const { optimize } = require('svgo');

// Command-line arguments for specifying input and output SVG files
const [inputFile, outputFile] = process.argv.slice(2);

// Ensure proper usage by checking the number of arguments
if (!inputFile || !outputFile) {
  console.error('Usage: node simple-svgo.js <input.svg> <output.svg>');
  process.exit(1);
}

// Function to read, optimize, and write the SVG file
function processSvg(inputFile, outputFile) {
  fs.readFile(inputFile, 'utf8', (readErr, data) => {
    if (readErr) {
      console.error(`Error reading file ${inputFile}: ${readErr}`);
      process.exit(1);
      return;
    }

    // Optimize SVG data using svgo
    const optimizedResult = optimize(data, {
      path: inputFile,
      multipass: true,
      plugins: ['preset-default']
    });

    // Write the optimized SVG data to the output file
    fs.writeFile(outputFile, optimizedResult.data, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file ${outputFile}: ${writeErr}`);
        process.exit(1);
        return;
      }

      console.log(`Optimized SVG successfully saved to ${outputFile}`);
    });
  });
}

// Execute the SVG processing function
processSvg(inputFile, outputFile);
