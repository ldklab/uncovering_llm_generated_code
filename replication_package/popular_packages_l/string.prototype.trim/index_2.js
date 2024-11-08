// index.js
(function() {
    'use strict';

    // Function to create a custom trim implementation
    const createTrimFunction = () => {
        // Whitespace characters excluding the zero-width space
        const whitespaceChars = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
        const zeroWidthSpace = '\u200B'; // zero-width space
        const trimmedWhitespace = whitespaceChars.replace(zeroWidthSpace, ''); // Exclude the zero-width space

        // Regex to match leading and trailing whitespace
        const trimPattern = new RegExp('^[' + trimmedWhitespace + ']+|[' + trimmedWhitespace + ']+$', 'g');

        // Return the trim function to remove leading/trailing whitespace
        return function trim() {
            return String(this).replace(trimPattern, '');
        };
    };

    const customTrim = createTrimFunction();

    // Function using custom trim implementation
    const trimFunction = function(value) {
        return customTrim.call(value);
    };

    // Shim to add custom trim implementation to String.prototype if needed
    trimFunction.shim = function applyTrimShim() {
        if (!String.prototype.trim || '\u200B'.trim() !== '\u200B') {
            String.prototype.trim = customTrim;
        }
    };

    // Export the trim function
    module.exports = trimFunction;
})();
