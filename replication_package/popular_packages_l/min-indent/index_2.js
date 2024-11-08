// min-indent/index.js
'use strict';

/**
 * Compute the smallest indentation among non-empty lines in a string.
 * 
 * @param {string} str - Input string to process.
 * @returns {number} - The minimum number of leading whitespaces.
 */
function minIndent(str) {
    // Split the string into individual lines
    const lines = str.split('\n');
    // Initialize minIndent to a very large number
    let minIndent = Infinity;

    // Loop through each line to determine the smallest indent
    for (const line of lines) {
        // Skip empty lines
        if (line.trim() === '') continue;

        // Retrieve length of leading spaces
        const leadingWhitespace = line.match(/^\s*/)[0].length;
        // Update minIndent with the smallest discovered indentation
        if (leadingWhitespace < minIndent) {
            minIndent = leadingWhitespace;
        }
    }

    // Return 0 if no indentation found, otherwise return minIndent
    return minIndent === Infinity ? 0 : minIndent;
}

module.exports = minIndent;

// Example usage
/*
const minIndent = require('./index');

const str = '\tunicorn\n\t\tcake';
console.log(minIndent(str)); // Output: 1
*/
