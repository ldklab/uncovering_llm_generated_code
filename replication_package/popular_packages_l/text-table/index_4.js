function textTable(rows, opts = {}) {
    const horizontalSeparator = opts.hsep || '  ';
    const columnAlignment = opts.align || [];
    const calculateStringLength = opts.stringLength || defaultStringLength;

    // Calculate the maximum width for each column
    const columnWidths = rows[0].map((_, columnIndex) => {
        return Math.max(...rows.map(row => calculateStringLength(row[columnIndex].toString())));
    });

    // Build the table using the calculated widths and specified alignments
    return rows.map(row => {
        return row.map((cell, columnIndex) => {
            const cellString = cell.toString();
            const columnWidth = columnWidths[columnIndex];
            return formatCellContent(cellString, columnWidth, columnAlignment[columnIndex], calculateStringLength);
        }).join(horizontalSeparator);
    }).join('\n');
}

function defaultStringLength(string) {
    return string.length;
}

function formatCellContent(string, columnWidth, alignment, calculateStringLength) {
    const contentLength = calculateStringLength(string);
    const paddingSize = columnWidth - contentLength;

    // Handle right, center, dot, and default (left) alignment
    if (alignment === 'r') {
        return ' '.repeat(paddingSize) + string;
    } else if (alignment === 'c') {
        const halfPadding = Math.floor(paddingSize / 2);
        return ' '.repeat(halfPadding) + string + ' '.repeat(paddingSize - halfPadding);
    } else if (alignment === '.') {
        const [integerPart, fractionalPart = ''] = string.split('.');
        const integerLength = calculateStringLength(integerPart);
        return ' '.repeat(columnWidth - integerLength - fractionalPart.length) + string;
    }
    // Default to left alignment
    return string + ' '.repeat(paddingSize);
}

module.exports = textTable;

// Usage example:
// const table = require('./text-table');
// const formattedTable = table(dataArray, optionsObj);
