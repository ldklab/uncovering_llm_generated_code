module.exports = function formatTable(rows, opts = {}) {
    const hsep = opts.hsep || '  ';
    const align = opts.align || [];
    const stringLength = opts.stringLength || (s => String(s).length);

    const computeDotSizes = rows => {
        return rows.reduce((acc, row) => {
            row.forEach((cell, index) => {
                const dotPosition = findDotPosition(cell);
                acc[index] = Math.max(acc[index] || 0, dotPosition);
            });
            return acc;
        }, []);
    };

    const findDotPosition = string => {
        const match = /\.[^.]*$/.exec(string);
        return match ? match.index + 1 : string.length;
    };

    const mapRowsWithDots = (rows, dotSizes) => {
        return rows.map(row => {
            return row.map((cell, index) => {
                const cellStr = String(cell);
                if (align[index] === '.') {
                    const dotOffset = findDotPosition(cellStr);
                    const paddingSize = dotSizes[index] + (/\./.test(cellStr) ? 1 : 2) - (stringLength(cellStr) - dotOffset);
                    return cellStr + ' '.repeat(paddingSize);
                }
                return cellStr;
            });
        });
    };

    const computeColWidths = rows => {
        return rows.reduce((acc, row) => {
            row.forEach((cell, index) => {
                const cellLength = stringLength(cell);
                acc[index] = Math.max(acc[index] || 0, cellLength);
            });
            return acc;
        }, []);
    };

    const applyAlignments = (rows, sizes) => {
        return rows.map(row => {
            return row.map((cell, index) => {
                const padding = (sizes[index] - stringLength(cell)) || 0;
                const space = ' '.repeat(Math.max(padding + 1, 1));
                if (align[index] === 'r' || align[index] === '.') {
                    return space + cell;
                } else if (align[index] === 'c') {
                    const leftSpace = ' '.repeat(Math.ceil(padding / 2));
                    const rightSpace = ' '.repeat(Math.floor(padding / 2));
                    return leftSpace + cell + rightSpace;
                }
                return cell + space;
            }).join(hsep).trimEnd();
        }).join('\n');
    };

    const dotSizes = computeDotSizes(rows);
    const rowsWithDots = mapRowsWithDots(rows, dotSizes);
    const colWidths = computeColWidths(rowsWithDots);
    return applyAlignments(rowsWithDots, colWidths);
};
