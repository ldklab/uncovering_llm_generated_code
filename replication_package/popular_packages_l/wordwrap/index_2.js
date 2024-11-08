// wordwrap.js

function wordwrap(startOrStop, stopOrParams, params) {
    // Initialize the start and stop values
    let start, stop;
    if (typeof stopOrParams === 'object') {
        // When the second argument is an object, treat it as params
        stop = startOrStop;
        start = 0;
        params = stopOrParams;
    } else {
        // For two numeric arguments, start and stop are assigned directly
        start = startOrStop;
        stop = stopOrParams || 0;
        params = params || { mode: 'soft' }; // Default to soft mode
    }

    // Determine line splitting mode, soft by default
    const mode = params.mode || 'soft';
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    // The returned function will perform word wrapping
    return function (text) {
        const lines = [];
        // Start each line with the indent of spaces
        let currentLine = ' '.repeat(start);
        // Split text into words/spaces based on the regex
        const words = text.split(regex);

        // Iterate over words and build wrapped lines
        for (const word of words) {
            if (currentLine.length + word.length > stop) {
                // If adding a word exceeds the stop length, push current line
                lines.push(currentLine.trim());
                currentLine = ' '.repeat(start); // Start new line with spaces
            }
            currentLine += word;
        }

        // Push any remaining text as the final line
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        // Return wrapped text with lines joined by newlines
        return lines.join('\n');
    };
}

// Creates a hard wrapping function
wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};

// Make wordwrap function available as a module
module.exports = wordwrap;

// Usage example for wordwrap in another file (meat.js)
const wrap = require('./wordwrap')(15);
console.log(wrap('You and your whole family are made out of meat.'));

// Usage example for wordwrap with different params (center.js)
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
