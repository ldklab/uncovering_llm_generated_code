module.exports = function wordwrap(start, stop, params) {
    // Adjust parameters if 'start' or 'stop' are objects
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
    
    // Set default 'stop' and 'start' if needed
    if (!stop) {
        stop = start;
        start = 0;
    }
    
    // Default parameters
    if (!params) params = {};
    const mode = params.mode || 'soft';
    const re = mode === 'hard' ? /\b/ : /(\S+\s+)/;
    
    return function (text) {
        const chunks = text.toString().split(re).reduce((acc, x) => {
            if (mode === 'hard') {
                for (let i = 0; i < x.length; i += stop - start) {
                    acc.push(x.slice(i, i + stop - start));
                }
            } else {
                acc.push(x);
            }
            return acc;
        }, []);
        
        return chunks.reduce((lines, rawChunk) => {
            if (rawChunk === '') return lines;
            
            const chunk = rawChunk.replace(/\t/g, '    ');
            
            const i = lines.length - 1;
            if (lines[i].length + chunk.length > stop) {
                lines[i] = lines[i].replace(/\s+$/, '');
                
                chunk.split(/\n/).forEach(c => {
                    lines.push(' '.repeat(start) + c.replace(/^\s+/, ''));
                });
            } else if (chunk.includes('\n')) {
                const xs = chunk.split(/\n/);
                lines[i] += xs.shift();
                xs.forEach(c => {
                    lines.push(' '.repeat(start) + c.replace(/^\s+/, ''));
                });
            } else {
                lines[i] += chunk;
            }
            
            return lines;
        }, [' '.repeat(start)]).join('\n');
    };
};

// Export additional utilities
wordwrap.soft = wordwrap;

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};
