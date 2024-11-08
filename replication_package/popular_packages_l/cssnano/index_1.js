// CSS Minification Module

// Import the `fs` module for filesystem operations
const fs = require('fs');

// Function to minify CSS content by eliminating whitespace and comments
function minifyCSS(content) {
    // Step 1: Remove all CSS comments
    let minified = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // Step 2: Replace consecutive whitespace with a single space, and remove newlines
    minified = minified.replace(/\s{2,}/g, ' ').replace(/\n/g, '');
    // Step 3: Remove spaces surrounding specific punctuation characters 
    minified = minified.replace(/\s*({|}|;|:|,)\s*/g, '$1');
    // Trim any leading or trailing whitespace and return result
    return minified.trim();
}

// Function to read a CSS file, minify its contents, and write it to a new file
function minifyCSSFile(sourcePath, destinationPath) {
    fs.readFile(sourcePath, 'utf8', (error, content) => {
        if (error) {
            console.error('File read error:', error);
            return; // Exit function on error
        }
        // Minify the read CSS content
        const minifiedContent = minifyCSS(content);
        
        // Write the minified content to the specified output file path
        fs.writeFile(destinationPath, minifiedContent, 'utf8', (error) => {
            if (error) {
                console.error('File write error:', error);
                return; // Exit function on error
            }
            // Log success message with output file path
            console.log(`CSS successfully minified and saved to ${destinationPath}`);
        });
    });
}

// Sample file paths for minification process
const inputPath = 'style.css'; // Path to the input CSS file
const outputPath = 'style.min.css'; // Path to save the minified CSS file

// Execute CSS file minification
minifyCSSFile(inputPath, outputPath);

// Export functions for external use (for testing or integration)
module.exports = { minifyCSS, minifyCSSFile };
