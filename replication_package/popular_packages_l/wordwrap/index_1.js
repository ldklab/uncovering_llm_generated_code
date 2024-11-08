// wordwrap.js

function wordwrap(startOrStop, stopOrParams, params) {
    let start, stop;
    
    // Determine if stopOrParams is an object, indicating parameter type
    if (typeof stopOrParams === 'object') {
        // Set stop to startOrStop, start to 0, and params to stopOrParams
        stop = startOrStop;
        start = 0;
        params = stopOrParams;
    } else {
        // Otherwise, set start and stop based on input, default params
        start = startOrStop;
        stop = stopOrParams || 0;
        params = params || { mode: 'soft' };
    }

    // Default mode to 'soft' if not provided
    const mode = params.mode || 'soft';
    // Choose word splitting regex based on the mode
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    return function (text) {
        const lines = [];
        let currentLine = ' '.repeat(start); // Leading spaces for line starting
        const words = text.split(regex); // Split text into words/phrases

        for (const word of words) {
            // If adding word exceeds stop length, create a new line
            if (currentLine.length + word.length > stop) {
                lines.push(currentLine.trim()); // Add trimmed line
                currentLine = ' '.repeat(start); // Reset line with initial spaces
            }
            // Add word to the current line
            currentLine += word;
        }

        // Add the last line if non-empty
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        // Join lines into a string with newline characters
        return lines.join('\n');
    };
}

// Define hard mode wordwrap function
wordwrap.hard = function (start, stop) {
    return wordwrap(start, stop, { mode: 'hard' });
};

// Export the wordwrap function
module.exports = wordwrap;

// Usage example for wordwrap with default settings
const wrap = require('./wordwrap')(15);
console.log(wrap('You and your whole family are made out of meat.'));

// Usage example for wordwrap with start and stop
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
