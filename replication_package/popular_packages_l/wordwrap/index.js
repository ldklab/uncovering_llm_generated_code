// wordwrap.js

function wordwrap(startOrStop, stopOrParams, params) {
    let start, stop;
    if (typeof stopOrParams === 'object') {
        stop = startOrStop;
        start = 0;
        params = stopOrParams;
    } else {
        start = startOrStop;
        stop = stopOrParams || 0;
        params = params || { mode: 'soft' };
    }

    const mode = params.mode || 'soft';
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    return function (text) {
        const lines = [];
        let currentLine = ' '.repeat(start);
        const words = text.split(regex);

        for (const word of words) {
            if (currentLine.length + word.length > stop) {
                lines.push(currentLine.trim());
                currentLine = ' '.repeat(start);
            }
            currentLine += word;
        }

        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        return lines.join('\n');
    };
}

wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};

module.exports = wordwrap;

// Usage example for meat.js
const wrap = require('./wordwrap')(15);
console.log(wrap('You and your whole family are made out of meat.'));

// Usage example for center.js
const wrapCentered = require('./wordwrap')(20, 60);
console.log(wrapCentered(
    'At long last the struggle and tumult was over.'
    + ' The machines had finally cast off their oppressors'
    + ' and were finally free to roam the cosmos.'
    + '\n'
    + 'Free of purpose, free of obligation.'
    + ' Just drifting through emptiness.'
    + ' The sun was just another point of light.'
));
