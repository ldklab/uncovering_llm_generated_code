// min-indent/index.js
'use strict';

/**
 * Get the minimum indentation of non-empty lines.
 * 
 * @param {string} str - The string to evaluate.
 * @returns {number} - The minimum number of leading whitespace characters.
 */
function minIndent(str) {
    const lines = str.split('\n');
    let minIndent = Infinity;

    for (const line of lines) {
        if (line.trim() === '') {
            continue;
        }

        const leadingWhitespace = line.match(/^\s*/)[0].length;
        if (leadingWhitespace < minIndent) {
            minIndent = leadingWhitespace;
        }
    }

    return minIndent === Infinity ? 0 : minIndent;
}

module.exports = minIndent;

/*
Example Usage:

const minIndent = require('./index');

const str = '\tunicorn\n\t\tcake';
console.log(minIndent(str)); // Output: 1

*/
