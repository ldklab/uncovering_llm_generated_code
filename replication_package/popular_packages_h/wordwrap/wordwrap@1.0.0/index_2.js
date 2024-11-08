var wordwrap = module.exports = function (start, stop, params) {
    if (typeof start === 'object') {
        params = start;
        start = params.start || 0;
        stop = params.stop;
    }

    if (typeof stop === 'object') {
        params = stop;
        start = start || params.start || 0;
        stop = undefined;
    }

    stop = stop || start;
    start = start || 0;
    params = params || {};

    var mode = params.mode || 'soft';
    var re = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    return function (text) {
        var chunks = text.toString().split(re).reduce((acc, x) => {
            if (mode === 'hard') {
                for (var i = 0; i < x.length; i += stop - start) {
                    acc.push(x.slice(i, i + stop - start));
                }
            } else {
                acc.push(x);
            }
            return acc;
        }, []);

        return chunks.reduce((lines, rawChunk) => {
            if (rawChunk === '') return lines;

            var chunk = rawChunk.replace(/\t/g, '    ');
            var i = lines.length - 1;

            if (lines[i].length + chunk.length > stop) {
                lines[i] = lines[i].replace(/\s+$/, '');
                chunk.split(/\n/).forEach(c => {
                    lines.push(' '.repeat(start) + c.trimLeft());
                });
            } else if (chunk.includes('\n')) {
                var parts = chunk.split(/\n/);
                lines[i] += parts.shift();
                parts.forEach(c => {
                    lines.push(' '.repeat(start) + c.trimLeft());
                });
            } else {
                lines[i] += chunk;
            }

            return lines;
        }, [' '.repeat(start)]).join('\n');
    };
};

wordwrap.soft = wordwrap;

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};
