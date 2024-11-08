// index.js

// Module for XML 1.0 Edition 5
module.exports['xml/1.0/ed5'] = (function() {
  // Regular expressions to define valid XML name start characters and name characters.
  const NAME_START_CHAR_RE = /^[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;
  const NAME_CHAR_RE = /^[A-Z-._a-z0-9\u00B7\u0300-\u036F\u203F-\u2040]$/;

  return {
    fragments: {
      // Export the source of regular expressions for potential debugging or documentation needs.
      NAME_START_CHAR: NAME_START_CHAR_RE.source,
      NAME_CHAR: NAME_CHAR_RE.source
    },
    regex: {
      // Regular expression to validate XML names that start with a valid character followed by zero or more valid name characters.
      NAME: new RegExp(`^${NAME_START_CHAR_RE.source}(${NAME_CHAR_RE.source})*$`)
    },
    lists: {
      // Lists of valid XML name start characters and name characters
      NAME_START_CHARS: ["A-Z", "_", "a-z", "\u00C0-\u00D6", "\u00D8-\u00F6", "\u00F8-\u02FF", "\u0370-\u037D", "\u037F-\u1FFF", "\u200C-\u200D", "\u2070-\u218F", "\u2C00-\u2FEF", "\u3001-\uD7FF", "\uF900-\uFDCF", "\uFDF0-\uFFFD"],
      NAME_CHARS: ["A-Z", "-", ".", "_", "a-z", "0-9", "\u00B7", "\u0300-\u036F", "\u203F-\u2040"]
    },
    functions: {
      // Function to check if a character is a valid XML name start character.
      isNameStartChar: function(char) {
        return NAME_START_CHAR_RE.test(char);
      },
      // Function to check if a character is a valid XML name character.
      isNameChar: function(char) {
        return NAME_CHAR_RE.test(char);
      }
    }
  };
})();

// Usage Example:
// To use this module, you can import it and check if specific characters or names are valid according to XML 1.0 Edition 5 specification.
// Example:
// const xml10ed5 = require('./index.js')['xml/1.0/ed5'];
// console.log(xml10ed5.functions.isNameStartChar('A'));  // true
// console.log(xml10ed5.regex.NAME.test('ValidName123')); // true
