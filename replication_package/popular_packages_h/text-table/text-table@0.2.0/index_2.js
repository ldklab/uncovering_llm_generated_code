module.exports = function formatTable(rows_, opts = {}) {
    const hsep = opts.hsep !== undefined ? opts.hsep : '  ';
    const align = opts.align || [];
    const stringLength = opts.stringLength || (s => String(s).length);

    const dotsizes = reduce(rows_, (acc, row) => {
        forEach(row, (cell, index) => {
            const dotPosition = dotindex(cell);
            acc[index] = Math.max(acc[index] || 0, dotPosition);
        });
        return acc;
    }, []);

    const rows = map(rows_, row =>
        map(row, (cell, index) => {
            let cellStr = String(cell);
            if (align[index] === '.') {
                const dotPos = dotindex(cellStr);
                const extraSpaces = dotsizes[index] + (/\./.test(cellStr) ? 1 : 2) - (stringLength(cellStr) - dotPos);
                return cellStr + ' '.repeat(extraSpaces);
            }
            return cellStr;
        })
    );

    const columnSizes = reduce(rows, (acc, row) => {
        forEach(row, (cell, index) => {
            const cellLength = stringLength(cell);
            acc[index] = Math.max(acc[index] || 0, cellLength);
        });
        return acc;
    }, []);

    return map(rows, row =>
        map(row, (cell, index) => {
            const padding = (columnSizes[index] - stringLength(cell)) || 0;
            const spacePad = ' '.repeat(Math.max(padding + 1, 1));
            if (align[index] === 'r' || align[index] === '.') {
                return spacePad + cell;
            }
            if (align[index] === 'c') {
                const leftPad = ' '.repeat(Math.ceil(padding / 2 + 1));
                const rightPad = ' '.repeat(Math.floor(padding / 2 + 1));
                return leftPad + cell + rightPad;
            }
            return cell + spacePad;
        })
        .join(hsep)
        .replace(/\s+$/, '')
    ).join('\n');
};

function dotindex(cell) {
    const match = /\.[^.]*$/.exec(cell);
    return match ? match.index + 1 : cell.length;
}

function reduce(xs, fn, initial) {
    return xs.reduce ? xs.reduce(fn, initial) : (() => {
        let i = 0, acc = initial !== undefined ? initial : xs[i++];
        for (; i < xs.length; i++) fn(acc, xs[i], i);
        return acc;
    })();
}

function forEach(xs, fn) {
    if (xs.forEach) xs.forEach(fn);
    else for (let i = 0; i < xs.length; i++) fn(xs[i], i);
}

function map(xs, fn) {
    if (xs.map) return xs.map(fn);
    const result = [];
    for (let i = 0; i < xs.length; i++) result.push(fn(xs[i], i));
    return result;
}
