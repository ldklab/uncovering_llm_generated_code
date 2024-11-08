// index.js

// This module exports the functionality to validate XML element names according to the XML 1.0 Edition 5 specification.
module.exports['xml/1.0/ed5'] = (() => {
  // Regular expression to validate the starting character of an XML name according to XML 1.0 Edition 5 rules.
  const NAME_START_CHAR_RE = /^[A-Z_a-z]\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;

  // Regular expression to validate any character that can appear in an XML name, excluding the starting character.
  const NAME_CHAR_RE = /^[A-Z-._a-z0-9\u00B7\u0300-\u036F\u203F-\u2040]$/;

  return {
    // The fragments object stores the source of regular expressions as strings.
    fragments: {
      NAME_START_CHAR: NAME_START_CHAR_RE.source,
      NAME_CHAR: NAME_CHAR_RE.source
    },
    // The regex object contains a complete regular expression to validate full XML names.
    regex: {
      NAME: new RegExp(`^${NAME_START_CHAR_RE.source}(${NAME_CHAR_RE.source})*$`)
    },
    // The lists object provides arrays of character ranges that can start or appear in XML names.
    lists: {
      NAME_START_CHARS: [
        "A-Z", "_", "a-z", "\u00C0-\u00D6", "\u00D8-\u00F6", "\u00F8-\u02FF", "\u0370-\u037D", "\u037F-\u1FFF", 
        "\u200C-\u200D", "\u2070-\u218F", "\u2C00-\u2FEF", "\u3001-\uD7FF", "\uF900-\uFDCF", "\uFDF0-\uFFFD"
      ],
      NAME_CHARS: [
        "A-Z", "-", ".", "_", "a-z", "0-9", "\u00B7", "\u0300-\u036F", "\u203F-\u2040"
      ]
    },
    // Functions to validate whether a character is a valid starting character or a general name character.
    functions: {
      isNameStartChar: (char) => NAME_START_CHAR_RE.test(char),
      isNameChar: (char) => NAME_CHAR_RE.test(char)
    }
  };
})();

// Example modules can similarly be defined for other XML specifications such as 'xml/1.0/ed4', 'xml/1.1/ed2', and 'xmlns/1.0/ed3' with their respective validation logic.

// Usage Example (for XML 1.0 Edition 5):
// const xml10ed5 = require('./index.js')['xml/1.0/ed5'];
// console.log(xml10ed5.functions.isNameStartChar('A'));  // true
// console.log(xml10ed5.regex.NAME.test('ValidName123')); // true
