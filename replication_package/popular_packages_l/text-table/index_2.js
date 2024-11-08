// text-table/index.js

function textTable(rows, opts = {}) {
    const hsep = opts.hsep || '  ';
    const align = opts.align || [];
    const stringLength = opts.stringLength || defaultStringLength;

    const colWidths = calculateColumnWidths(rows, stringLength);

    return formatRows(rows, colWidths, align, stringLength, hsep);
}

function calculateColumnWidths(rows, stringLength) {
    return rows[0].map((_, colIdx) => {
        return Math.max(...rows.map(row => stringLength(row[colIdx].toString())));
    });
}

function formatRows(rows, colWidths, align, stringLength, hsep) {
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
            return str + ' '.repeat(padding);
    }
}

module.exports = textTable;
