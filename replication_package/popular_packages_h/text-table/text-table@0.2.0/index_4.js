module.exports = function (rows_, opts = {}) {
    const hsep = opts.hsep ?? '  ';
    const align = opts.align || [];
    const stringLength = opts.stringLength || ((s) => String(s).length);

    const dotsizes = reduce(rows_, (acc, row) => {
        forEach(row, (c, ix) => {
            const n = dotindex(c);
            if (!acc[ix] || n > acc[ix]) acc[ix] = n;
        });
        return acc;
    }, []);

    const rows = map(rows_, (row) => {
        return map(row, (c_, ix) => {
            const c = String(c_);
            if (align[ix] === '.') {
                const index = dotindex(c);
                const size = dotsizes[ix] + (/\./.test(c) ? 1 : 2) - (stringLength(c) - index);
                return c + ' '.repeat(size);
            } else return c;
        });
    });

    const sizes = reduce(rows, (acc, row) => {
        forEach(row, (c, ix) => {
            const n = stringLength(c);
            if (!acc[ix] || n > acc[ix]) acc[ix] = n;
        });
        return acc;
    }, []);

    return map(rows, (row) => {
        return map(row, (c, ix) => {
            const n = (sizes[ix] - stringLength(c)) || 0;
            const s = ' '.repeat(Math.max(n + 1, 1));
            if (align[ix] === 'r' || align[ix] === '.') {
                return s + c;
            }
            if (align[ix] === 'c') {
                const padLeft = ' '.repeat(Math.ceil(n / 2));
                const padRight = ' '.repeat(Math.floor(n / 2));
                return padLeft + c + padRight;
            }
            return c + s;
        }).join(hsep).replace(/\s+$/, '');
    }).join('\n');
};

function dotindex(c) {
    const m = /\.[^.]*$/.exec(c);
    return m ? m.index + 1 : c.length;
}

function reduce(xs, f, init) {
    return xs.reduce ? xs.reduce(f, init) : (xs => {
        let acc = (arguments.length >= 3) ? init : xs[0];
        for (let i = (init === undefined ? 1 : 0); i < xs.length; i++) {
            acc = f(acc, xs[i], i);
        }
        return acc;
    })(xs);
}

function forEach(xs, f) {
    return xs.forEach ? xs.forEach(f) : (xs => {
        for (let i = 0; i < xs.length; i++) {
            f(xs[i], i);
        }
    })(xs);
}

function map(xs, f) {
    return xs.map ? xs.map(f) : (xs => {
        const res = [];
        for (let i = 0; i < xs.length; i++) {
            res.push(f(xs[i], i));
        }
        return res;
    })(xs);
}
