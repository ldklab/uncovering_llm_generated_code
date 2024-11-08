// text-table/index.js

function textTable(rows, options = {}) {
    const hsep = options.hsep || '  '; // Horizontal separator between columns
    const alignment = options.align || []; // Alignment options for each column
    const measureStringLength = options.stringLength || defaultStringLength;

    // Calculate the maximum column width for each column
    const columnWidths = rows[0].map((_, columnIndex) => 
        Math.max(...rows.map(row => measureStringLength(row[columnIndex].toString())))
    );

    // Create the formatted table
    return rows.map(row => 
        row.map((cell, columnIndex) => {
            const cellText = cell.toString();
            const columnWidth = columnWidths[columnIndex];
            return formatCell(cellText, columnWidth, alignment[columnIndex], measureStringLength);
        }).join(hsep)
    ).join('\n');
}

// Default function to calculate the string length
function defaultStringLength(str) {
    return str.length;
}

// Format a single cell based on alignment and width
function formatCell(text, width, alignment, measureStringLength) {
    const textLength = measureStringLength(text);
    const padding = width - textLength;

    if (alignment === 'r') { // Right alignment
        return ' '.repeat(padding) + text;
    } else if (alignment === 'c') { // Center alignment
        const halfPadding = Math.floor(padding / 2);
        return ' '.repeat(halfPadding) + text + ' '.repeat(padding - halfPadding);
    } else if (alignment === '.') { // Decimal alignment
        const [integerPart, fractionalPart = ''] = text.split('.');
        const integerPartLength = measureStringLength(integerPart);
        return ' '.repeat(width - integerPartLength - fractionalPart.length) + text;
    }
    // Defaults to left alignment
    return text + ' '.repeat(padding);
}

module.exports = textTable;

// To use this package, save it as index.js and then:
// var table = require('./text-table');
// Example call: var t = table(data, options);
