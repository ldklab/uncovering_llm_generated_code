// index.js
(function() {
    'use strict';

    var createTrimFunction = function() {
        // Define a set of whitespace characters excluding the zero-width character
        var whitespaceChars = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
        var zeroWidthChar = '\u200B';
        var whitespaceWithoutZeroWidth = whitespaceChars.replace(zeroWidthChar, '');

        // Create a regular expression to trim leading and trailing whitespace
        var trimPattern = new RegExp('^[' + whitespaceWithoutZeroWidth + ']+|[' + whitespaceWithoutZeroWidth + ']+$', 'g');

        // Return a function to trim whitespace from a string
        return function() {
            return String(this).replace(trimPattern, '');
        };
    }();

    // Trim function that uses the created trim function to trim a string
    var trim = function(value) {
        return createTrimFunction.call(value);
    };

    // Method to add a shim for String.prototype.trim if it's not natively supported or behaves incorrectly
    trim.shim = function installTrimShim() {
        if (!String.prototype.trim || '\u200B'.trim() !== '\u200B') {
            String.prototype.trim = createTrimFunction;
        }
    };

    // Export the trim function as a module
    module.exports = trim;
})();
