module.exports = function formatTable(rows, options = {}) {
    const hsep = options.hsep !== undefined ? options.hsep : '  ';
    const align = options.align || [];
    const stringLength = options.stringLength || (s => String(s).length);

    const decimalSizes = calculateDecimalSizes(rows);
    const formattedRows = formatRows(rows, decimalSizes, align, stringLength);
    const columnWidths = calculateColumnWidths(formattedRows, stringLength);

    return formattedRows.map(row => {
        return row.map((content, colIndex) => {
            const paddingSize = columnWidths[colIndex] - stringLength(content);
            const padding = ' '.repeat(Math.max(paddingSize, 0));

            if (align[colIndex] === 'r' || align[colIndex] === '.') {
                return padding + content;
            } else if (align[colIndex] === 'c') {
                const halfPadding = paddingSize / 2;
                return ' '.repeat(Math.floor(halfPadding)) + content + ' '.repeat(Math.ceil(halfPadding));
            } else {
                return content + padding;
            }
        }).join(hsep).trimEnd();
    }).join('\n');
};

function calculateDecimalSizes(rows) {
    return rows.reduce((acc, row) => {
        row.forEach((cell, ix) => {
            const pos = findDecimalIndex(cell);
            if (!acc[ix] || pos > acc[ix]) {
                acc[ix] = pos;
            }
        });
        return acc;
    }, []);
}

function formatRows(rows, decimalSizes, align, stringLength) {
    return rows.map(row => {
        return row.map((cell, ix) => {
            let content = String(cell);
            if (align[ix] === '.') {
                const decIndex = findDecimalIndex(content);
                const padSize = decimalSizes[ix] + (/\./.test(content) ? 1 : 2) - (stringLength(content) - decIndex);
                return content + ' '.repeat(padSize);
            }
            return content;
        });
    });
}

function calculateColumnWidths(rows, stringLength) {
    return rows.reduce((acc, row) => {
        row.forEach((cell, ix) => {
            const length = stringLength(cell);
            if (!acc[ix] || length > acc[ix]) {
                acc[ix] = length;
            }
        });
        return acc;
    }, []);
}

function findDecimalIndex(content) {
    const match = /\.[^.]*$/.exec(content);
    return match ? match.index + 1 : content.length;
}
