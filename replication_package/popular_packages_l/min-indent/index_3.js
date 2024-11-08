// min-indent/index.js
'use strict';

/**
 * Determine the minimum indentation of non-empty lines in a string.
 *
 * @param {string} str - The input string to check.
 * @returns {number} - The minimum number of leading whitespace characters.
 */
function minIndent(str) {
    const lines = str.split('\n');
    let minimumIndent = Infinity;

    for (const line of lines) {
        if (!line.trim()) {
            continue;
        }

        const indentLength = line.match(/^\s*/)[0].length;
        if (indentLength < minimumIndent) {
            minimumIndent = indentLength;
        }
    }

    return minimumIndent === Infinity ? 0 : minimumIndent;
}

module.exports = minIndent;

/*
Example Usage:

const minIndent = require('./index');

const str = '\tunicorn\n\t\tcake';
console.log(minIndent(str)); // Output: 1

*/
