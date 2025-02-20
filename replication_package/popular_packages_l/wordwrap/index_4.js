// wordwrap.js

/**
 * Function to create a word wrapping function with specified start and stop positions.
 * @param {number} startOrStop - The starting indent or stopping column position.
 * @param {number|object} stopOrParams - The stopping column position or parameters object.
 * @param {object} [params] - Optional parameters containing wrapping mode.
 * @returns {function} - A wrapping function that processes text input.
 */
function wordwrap(startOrStop, stopOrParams, params) {
    let start, stop;
    
    // Determine if stopOrParams is an object, which means params are provided directly.
    if (typeof stopOrParams === 'object') {
        stop = startOrStop;
        start = 0;
        params = stopOrParams;
    } else {
        start = startOrStop;
        stop = stopOrParams || 0;
        params = params || { mode: 'soft' };
    }
    
    // Obtain mode from parameters, defaulting to 'soft'
    const mode = params.mode || 'soft';
    const regex = mode === 'hard' ? /\b/ : /(\S+\s+)/;

    /**
     * The function to wrap text according to the configuration.
     * @param {string} text - The input text to be wrapped.
     * @returns {string} - Wrapped text with lines joined by newlines.
     */
    return function (text) {
        const lines = [];
        let currentLine = ' '.repeat(start);
        const words = text.split(regex);

        for (const word of words) {
            // Check if adding the word exceeds the stop limit
            if (currentLine.length + word.length > stop) {
                lines.push(currentLine.trim());
                currentLine = ' '.repeat(start);
            }
            currentLine += word;
        }

        // Add any remaining text in currentLine to lines
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }

        return lines.join('\n');
    };
}

/**
 * This function acts as a simplified interface for wordwrapping in 'hard' mode.
 * @param {number} start - The starting position indented from the left.
 * @param {number} stop - The position where text wrapping should occur.
 * @returns {function} - A configured text wrapping function.
 */
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
