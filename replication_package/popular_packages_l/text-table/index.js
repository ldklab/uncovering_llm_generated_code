markdown
// text-table/index.js

function textTable(rows, opts = {}) {
    const hsep = opts.hsep || '  ';
    const align = opts.align || [];
    const stringLength = opts.stringLength || defaultStringLength;
    
    // Determine the maximum width of each column
    const colWidths = rows[0].map((_, colIdx) => {
        return Math.max(...rows.map(row => stringLength(row[colIdx].toString())));
    });

    // Format the table
    return rows.map(row => {
        return row.map((cell, colIdx) => {
            const cellString = cell.toString();
            const width = colWidths[colIdx];
            
            return formatCell(cellString, width, align[colIdx], stringLength);
        }).join(hsep);
    }).join('\n');
}

function defaultStringLength(str) {
    return str.length;
}

function formatCell(str, width, alignment, stringLength) {
    const length = stringLength(str);
    const padding = width - length;
    if (alignment === 'r') {
        return ' '.repeat(padding) + str;
    } else if (alignment === 'c') {
        const halfPadding = Math.floor(padding / 2);
        return ' '.repeat(halfPadding) + str + ' '.repeat(padding - halfPadding);
    } else if (alignment === '.') {
        const [intPart, fracPart = ''] = str.split('.');
        const intLength = stringLength(intPart);
        return ' '.repeat(width - intLength - fracPart.length) + str;
    }
    // Defaults to left align
    return str + ' '.repeat(padding);
}

module.exports = textTable;

// To use this package, save it as index.js and then:
// var table = require('./text-table');
// Example call: var t = table(data, options);
