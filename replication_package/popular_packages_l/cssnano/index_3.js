// Importing the 'fs' module to handle file system operations
const fs = require('fs');

// Function to minify a CSS string
function minifyCSS(input) {
    // Step 1: Remove all CSS comments within the input string
    let output = input.replace(/\/\*[\s\S]*?\*\//g, '');
    // Step 2: Replace consecutive whitespace characters with a single space, and remove newlines
    output = output.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
    // Step 3: Remove spaces around common CSS separators and punctuation
    output = output.replace(/\s*({|}|;|:|,)\s*/g, '$1');
    // Step 4: Return the minified CSS string, with leading/trailing whitespace removed
    return output.trim();
}

// Function to read, minify, and write a CSS file
function minifyCSSFile(inputPath, outputPath) {
    // Read the CSS file asynchronously
    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Minify the CSS data read from the file
        const minifiedData = minifyCSS(data);
        // Write the minified CSS output to a new file
        fs.writeFile(outputPath, minifiedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            // Log a confirmation message upon successful write operation
            console.log(`CSS minification complete. Output written to ${outputPath}`);
        });
    });
}

// Example usage file paths
const inputFilePath = 'style.css'; // Path to the original CSS file
const outputFilePath = 'style.min.css'; // Path for the minified CSS output

// Execute the CSS file minification process
minifyCSSFile(inputFilePath, outputFilePath);

// Export the functions for use as a module
module.exports = { minifyCSS, minifyCSSFile };
