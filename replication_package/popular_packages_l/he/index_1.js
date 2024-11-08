// he.js

const he = {
  version: '1.0.0',
  
  // Function to encode text by converting certain characters to HTML entities
  encode: function(text, options = {}) {
    const {
      useNamedReferences = false, 
      decimal = false,
      encodeEverything = false,
      strict = false,
      allowUnsafeSymbols = false,
    } = options;

    const namedEntities = {
      '©': '&copy;',
      '≠': '&ne;',
      '𝌆': '&#x1D306;',
    };

    let encodedText = '';
    for (const char of text) {
      const code = char.codePointAt(0); // Get the Unicode code point of the character

      if (useNamedReferences && namedEntities[char]) {
        encodedText += namedEntities[char]; // Use named entity if applicable
      } else if ((code < 32 || code > 126) || encodeEverything) {
        // Encode using decimal or hexadecimal entity reference
        encodedText += decimal ? `&#${code};` : `&#x${code.toString(16).toUpperCase()};`;
      } else if ((strict && char === '\0') || (!allowUnsafeSymbols && /[&<>"'`]/.test(char))) {
        throw new Error('Invalid character.'); // Throw error if character is unsafe or null character is found in strict mode
      } else {
        encodedText += char; // Keep the original character if it's safe
      }
    }
    return encodedText; // Return the encoded text
  },

  // Function to decode HTML entities back to their original characters
  decode: function(html, options = {}) {
    const { isAttributeValue = false, strict = false } = options; // Extract options, currently 'isAttributeValue' is unused

    const namedEntities = {
      '&copy;': '©',
      '&ne;': '≠',
      '&#x1D306;': '𝌆',
    };

    return html.replace(/&(?:#x[0-9A-Fa-f]+|#[0-9]+|[a-zA-Z]+);/g, match => {
      if (namedEntities[match]) {
        return namedEntities[match]; // Decode named entity
      }
      
      let num;
      if (match.startsWith('&#x')) {
        num = parseInt(match.slice(3, -1), 16); // Parse hexadecimal numeric entity
      } else if (match.startsWith('&#')) {
        num = parseInt(match.slice(2, -1), 10); // Parse decimal numeric entity
      }

      if (num && (num < 32 || num > 126)) {
        return String.fromCodePoint(num); // Convert back if within valid range
      } else if (strict) {
        throw new Error('Invalid character reference.'); // Throw error if invalid in strict mode
      }
      return match; // Return the original match if no decoding happens and not strict
    });
  },

  // Function to escape special characters to prevent XSS vulnerabilities
  escape: function(text) {
    return text.replace(/[&<>"'`]/g, function(match) {
      // Replace each special character with equivalent HTML entity
      switch (match) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '`': return '&#x60;';
      }
    });
  },
};

module.exports = he; // Export the module
