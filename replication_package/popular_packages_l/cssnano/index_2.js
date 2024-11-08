// Simple CSS Minification Library

// Importing the file system module
const fs = require('fs');

// Function to minify CSS content
// This function will remove comments, excess whitespace, and unnecessary spaces around specific characters
function minifyCSS(input) {
    // Strip out CSS comments
    let output = input.replace(/\/\*[\s\S]*?\*\//g, '');
    // Compress multiple spaces and newlines into a single space
    output = output.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
    // Eliminate spaces around special CSS characters
    output = output.replace(/\s*({|}|;|:|,)\s*/g, '$1');
    return output.trim();
}

// Function to minify CSS from a file and save to another file
// Reads CSS file, minifies it, and writes the result to a new file
function minifyCSSFile(inputPath, outputPath) {
    // Asynchronously read the CSS file
    fs.readFile(inputPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Minify the file contents
        const minifiedData = minifyCSS(data);
        // Write the minified content to output file
        fs.writeFile(outputPath, minifiedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log(`CSS minification complete. Output written to ${outputPath}`);
        });
    });
}

// Example usage paths for input and output CSS files
const inputFilePath = 'style.css'; // Path to the original CSS file
const outputFilePath = 'style.min.css'; // Path to save the minified CSS file

// Perform CSS file minification
minifyCSSFile(inputFilePath, outputFilePath);

// Export for module usage
module.exports = { minifyCSS, minifyCSSFile };
