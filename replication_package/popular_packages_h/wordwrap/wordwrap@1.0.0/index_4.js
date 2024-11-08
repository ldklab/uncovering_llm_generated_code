class WordWrap {
    constructor(start, stop, params = {}) {
        if (typeof start === 'object') {
            ({ start, stop, ...params } = start);
        } else if (typeof stop === 'object') {
            params = stop;
            stop = undefined;
        }
        
        this.start = start || 0;
        this.stop = stop || start || 0;
        this.mode = params.mode || 'soft';
        this.re = this.mode === 'hard' ? /\b/ : /(\S+\s+)/;
    }

    wrap(text) {
        const chunks = text.toString()
            .split(this.re)
            .reduce((acc, chunk) => {
                if (this.mode === 'hard') {
                    for (let i = 0; i < chunk.length; i += this.stop - this.start) {
                        acc.push(chunk.slice(i, i + this.stop - this.start));
                    }
                } else {
                    acc.push(chunk);
                }
                return acc;
            }, []);
        
        return chunks.reduce((lines, rawChunk) => {
            if (rawChunk === '') return lines;
            
            const chunk = rawChunk.replace(/\t/g, '    ');
            const lastLineIndex = lines.length - 1;
            
            if (lines[lastLineIndex].length + chunk.length > this.stop) {
                lines[lastLineIndex] = lines[lastLineIndex].replace(/\s+$/, '');
                
                chunk.split(/\n/).forEach(part => {
                    lines.push(' '.repeat(this.start) + part.trimStart());
                });
            } else if (chunk.includes('\n')) {
                const splitChunks = chunk.split(/\n/);
                lines[lastLineIndex] += splitChunks.shift();
                splitChunks.forEach(part => {
                    lines.push(' '.repeat(this.start) + part.trimStart());
                });
            } else {
                lines[lastLineIndex] += chunk;
            }
            return lines;
        }, [' '.repeat(this.start)]).join('\n');
    }
}

const wordwrap = (start, stop, params) => new WordWrap(start, stop, params).wrap.bind(new WordWrap(start, stop, params));

wordwrap.soft = wordwrap;

wordwrap.hard = (start, stop) => new WordWrap(start, stop, { mode: 'hard' }).wrap.bind(new WordWrap(start, stop, { mode: 'hard' }));

module.exports = wordwrap;
