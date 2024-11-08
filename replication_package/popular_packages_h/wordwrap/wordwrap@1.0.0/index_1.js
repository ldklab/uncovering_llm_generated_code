function wordwrap(start, stop, params) {
    if (typeof start === 'object') {
        params = start;
        start = params.start;
        stop = params.stop;
    }

    if (typeof stop === 'object') {
        params = stop;
        start = start || params.start;
        stop = undefined;
    }

    if (!stop) {
        stop = start;
        start = 0;
    }

    params = params || {};
    const mode = params.mode || 'soft';
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    return function (text) {
        const chunks = text.toString()
            .split(regex)
            .reduce((acc, value) => {
                if (mode === 'hard') {
                    for (let i = 0; i < value.length; i += stop - start) {
                        acc.push(value.slice(i, i + stop - start));
                    }
                } else {
                    acc.push(value);
                }
                return acc;
            }, []);

        return chunks.reduce((lines, chunk) => {
            if (chunk === '') return lines;

            const processedChunk = chunk.replace(/\t/g, '    ');
            const lastIndex = lines.length - 1;

            if (lines[lastIndex].length + processedChunk.length > stop) {
                lines[lastIndex] = lines[lastIndex].replace(/\s+$/, '');
                processedChunk.split(/\n/).forEach((line) => {
                    lines.push(' '.repeat(start) + line.trimStart());
                });
            } else if (processedChunk.includes('\n')) {
                const parts = processedChunk.split(/\n/);
                lines[lastIndex] += parts.shift();
                parts.forEach((line) => {
                    lines.push(' '.repeat(start) + line.trimStart());
                });
            } else {
                lines[lastIndex] += processedChunk;
            }

            return lines;
        }, [' '.repeat(start)]).join('\n');
    };
}

wordwrap.soft = wordwrap;

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};

module.exports = wordwrap;
