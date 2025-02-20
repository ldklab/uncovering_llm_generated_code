// Import required file system module
const fs = require('fs');

// Function to minify CSS content
function minifyCSS(input) {
    // Step 1: Remove CSS comments
    let withoutComments = input.replace(/\/\*[\s\S]*?\*\//g, '');
    // Step 2: Collapse multiple spaces and remove line breaks
    let collapsedWhitespace = withoutComments.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
    // Step 3: Remove extra spaces around certain characters
    let compactedCSS = collapsedWhitespace.replace(/\s*({|}|;|:|,)\s*/g, '$1');
    // Return the trimmed, minified CSS
    return compactedCSS.trim();
}

// Function to read, minify and write CSS to a file
function minifyCSSFile(inputPath, outputPath) {
    // Read CSS file asynchronously
    fs.readFile(inputPath, 'utf8', (error, data) => {
        if (error) {
            console.error('Error reading file:', error);
            return;
        }
        // Minify the CSS content
        const minifiedContent = minifyCSS(data);
        // Write the minified CSS back to a file
        fs.writeFile(outputPath, minifiedContent, 'utf8', (error) => {
            if (error) {
                console.error('Error writing file:', error);
                return;
            }
            console.log(`CSS minification complete. Output written to ${outputPath}`);
        });
    });
}

// Specify input and output file paths
const inputFilePath = 'style.css'; // Source CSS file
const outputFilePath = 'style.min.css'; // Minified CSS destination

// Run the minification process
minifyCSSFile(inputFilePath, outputFilePath);

// Exports for module use
module.exports = { minifyCSS, minifyCSSFile };
