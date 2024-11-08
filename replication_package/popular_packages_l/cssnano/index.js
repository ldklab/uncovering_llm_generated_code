// cssnano-like minification library

// Importing required modules
const fs = require('fs');

// Function to minify CSS by removing whitespace and comments
function minifyCSS(input) {
    // Remove comments
    let output = input.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove whitespace
    output = output.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
    // Remove spaces around braces and semicolons
    output = output.replace(/\s*({|}|;|:|,)\s*/g, '$1');
    return output.trim();
}

// Function to read a CSS file, minify it, and save the result
function minifyCSSFile(inputPath, outputPath) {
    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        const minifiedData = minifyCSS(data);
        fs.writeFile(outputPath, minifiedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log(`CSS minification complete. Output written to ${outputPath}`);
        });
    });
}

// Example usage
const inputFilePath = 'style.css'; // Input CSS file path
const outputFilePath = 'style.min.css'; // Output minified CSS file path

minifyCSSFile(inputFilePath, outputFilePath);

module.exports = { minifyCSS, minifyCSSFile };
