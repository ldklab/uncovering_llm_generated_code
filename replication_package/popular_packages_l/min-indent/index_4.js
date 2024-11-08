// min-indent/index.js
'use strict';

/**
 * Calculate the minimum indentation of non-empty lines in a given string.
 * 
 * @param {string} text - The input string to evaluate.
 * @returns {number} - The count of the minimum leading whitespace characters.
 */
function calculateMinimumIndentation(text) {
    const lineArray = text.split('\n');
    let smallestIndent = Infinity;

    for (const line of lineArray) {
        if (line.trim() === '') {
            continue; // Skip empty lines
        }

        const currentIndentation = line.match(/^\s*/)[0].length;
        smallestIndent = Math.min(smallestIndent, currentIndentation);
    }

    return smallestIndent === Infinity ? 0 : smallestIndent;
}

module.exports = calculateMinimumIndentation;

/*
Example Usage:

const calculateMinimumIndentation = require('./index');

const multiLineString = '\tunicorn\n\t\tcake';
console.log(calculateMinimumIndentation(multiLineString)); // Output: 1

*/
