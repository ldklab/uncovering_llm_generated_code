// index.js

// Module for XML 1.0 Edition 5
module.exports['xml/1.0/ed5'] = (function() {
  
  // Regular expression for valid starting character in XML Names
  const NAME_START_CHAR_RE = /^[A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;
  
  // Regular expression for valid characters in XML Names
  const NAME_CHAR_RE = /^[A-Z-._a-z0-9\u00B7\u0300-\u036F\u203F-\u2040]$/;

  return {
    fragments: {
      // Export the source of the regex for reusability
      NAME_START_CHAR: NAME_START_CHAR_RE.source,
      NAME_CHAR: NAME_CHAR_RE.source
    },
    regex: {
      // Regex for validating an entire XML Name
      NAME: new RegExp(`^${NAME_START_CHAR_RE.source}(${NAME_CHAR_RE.source})*$`)
    },
    lists: {
      // Ranges for start characters of XML Names
      NAME_START_CHARS: [
        "A-Z", "_", "a-z", "\u00C0-\u00D6", "\u00D8-\u00F6", "\u00F8-\u02FF",
        "\u0370-\u037D", "\u037F-\u1FFF", "\u200C-\u200D", "\u2070-\u218F",
        "\u2C00-\u2FEF", "\u3001-\uD7FF", "\uF900-\uFDCF", "\uFDF0-\uFFFD"
      ],
      // Ranges for characters that can be used in XML Names
      NAME_CHARS: [
        "A-Z", "-", ".", "_", "a-z", "0-9", "\u00B7", "\u0300-\u036F", "\u203F-\u2040"
      ]
    },
    functions: {
      // Check if character is valid as a start character in XML Name
      isNameStartChar: function(char) {
        return NAME_START_CHAR_RE.test(char);
      },
      // Check if character is valid within an XML Name
      isNameChar: function(char) {
        return NAME_CHAR_RE.test(char);
      }
    }
  };
})();

// The same structure can be used to define modules for other XML specifications
// by updating the regular expressions and logic as per their unique rules.
