// index.js
(function() {
    'use strict';
    
    // Define a function to trim whitespace from strings
    var stringTrim = (function() {
        // List of whitespace characters excluding the zero-width space
        var whitespace = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
        var zeroWidthSpace = '\u200B';
        // Remove the zero-width space from the list
        var trimmedWhitespace = whitespace.replace(zeroWidthSpace, '');
        
        // Regex to match leading and trailing whitespace
        var trimRegex = new RegExp('^[' + trimmedWhitespace + ']+|[' + trimmedWhitespace + ']+$', 'g');
        
        // Function to apply the regex to trim the string
        return function() {
            return String(this).replace(trimRegex, '');
        };
    })();

    // Toplevel function to trim a given value
    var trim = function(value) {
        return stringTrim.call(value); // Using the trim function defined above
    };

    // Shim function to add trim functionality to String prototype if not natively supported
    trim.shim = function() {
        // Check if String.prototype.trim is missing or handles zero-width space incorrectly
        if (!String.prototype.trim || '\u200B'.trim() !== '\u200B') {
            String.prototype.trim = stringTrim;
        }
    };

    // Export the trim function as a module
    module.exports = trim;
})();
