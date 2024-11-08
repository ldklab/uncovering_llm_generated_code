// wordwrap.js

function wordwrap(startOrStop, stopOrParams, params) {
    let start, stop;
    
    // Determine if stopOrParams is an object and adjust start, stop, and params accordingly
    if (typeof stopOrParams === 'object') {
        stop = startOrStop;        // Treat startOrStop as the stop value
        start = 0;                 // Default start position is 0
        params = stopOrParams;     // Use provided object as params
    } else {
        start = startOrStop;       // Start from the provided startOrStop value
        stop = stopOrParams || 0;  // Stop at the provided stop value, default to 0
        params = params || { mode: 'soft' }; // Default params with mode 'soft'
    }

    const mode = params.mode || 'soft'; // Determine wrapping mode
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/; // Set regex based on wrapping mode

    return function (text) {
        const lines = [];
        let currentLine = ' '.repeat(start); // Initialize line with start spaces
        const words = text.split(regex); // Split text into words based on regex

        for (const word of words) {
            if (currentLine.length + word.length > stop) {
                lines.push(currentLine.trim()); // Push trimmed current line to lines
                currentLine = ' '.repeat(start); // Reset current line with start spaces
            }
            currentLine += word; // Append word to the current line
        }

        if (currentLine.trim()) {
            lines.push(currentLine.trim()); // Add last line if non-empty
        }

        return lines.join('\n'); // Join lines with new line character
    };
}

// Hard mode factory function using wordwrap
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
