// Enhanced Text Table Formatter

/**
 * Generates a formatted text table from a 2D array.
 * 
 * @param {Array<Array<any>>} rows - A 2D array where each inner array represents a row in the table.
 * @param {Object} opts - Optional configuration object.
 * @param {string} opts.hsep - Horizontal separator between columns (default is two spaces).
 * @param {Array<string>} opts.align - Array of alignment directives ('l', 'r', 'c', '.') for left, right, center, decimal alignments.
 * @param {Function} opts.stringLength - Custom function to calculate string length for alignment purposes (default uses string length).
 * @returns {string} A formatted string representing the table.
 */
function textTable(rows, opts = {}) {
    const {
        hsep = '  ',
        align = [],
        stringLength = defaultStringLength,
    } = opts;

    // Calculate maximum width for each column based on content length
    const colWidths = rows[0].map((_, colIdx) => {
        return Math.max(
            ...rows.map(row => stringLength(row[colIdx].toString()))
        );
    });

    // Construct formatted rows
    return rows.map(row => {
        return row.map((cell, colIdx) => {
            const cellString = cell.toString();
            const width = colWidths[colIdx];

            // Format individual cell with alignment and padding
            return formatCell(cellString, width, align[colIdx], stringLength);
        }).join(hsep);
    }).join('\n');
}

/**
 * Default function to calculate string length.
 * 
 * @param {string} str - The string whose length is to be calculated.
 * @returns {number} The length of the string.
 */
function defaultStringLength(str) {
    return str.length;
}

/**
 * Formats a cell based on alignment and required width.
 * 
 * @param {string} str - The cell content.
 * @param {number} width - The desired width of the cell.
 * @param {string} alignment - Alignment directive: 'l', 'r', 'c', or '.'.
 * @param {Function} stringLength - Function to get string length.
 * @returns {string} A formatted string for the table cell.
 */
function formatCell(str, width, alignment, stringLength) {
    const length = stringLength(str);
    const padding = width - length;

    switch (alignment) {
        case 'r':
            return ' '.repeat(padding) + str;
        case 'c':
            const halfPadding = Math.floor(padding / 2);
            return ' '.repeat(halfPadding) + str + ' '.repeat(padding - halfPadding);
        case '.':
            const [intPart, fracPart = ''] = str.split('.');
            const intLength = stringLength(intPart);
            return ' '.repeat(width - intLength - fracPart.length) + str;
        default:
            // Defaults to left alignment if no valid alignment is provided
            return str + ' '.repeat(padding);
    }
}

module.exports = textTable;

// To use this module, save it as index.js and then:
// const table = require('./text-table');
// Example usage: const t = table(data, options);
