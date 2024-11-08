markdown
// he.js

const he = {
  version: '1.0.0',
  encode: function(text, options = {}) {
    const useNamedReferences = options.useNamedReferences || false;
    const decimal = options.decimal || false;
    const encodeEverything = options.encodeEverything || false;
    const strict = options.strict || false;
    const allowUnsafeSymbols = options.allowUnsafeSymbols || false;

    const namedEntities = {
      '©': '&copy;',
      '≠': '&ne;',
      '𝌆': '&#x1D306;'
    };

    let encodedText = '';
    for (const char of text) {
      let code = char.codePointAt(0);
      if (useNamedReferences && namedEntities[char]) {
        encodedText += namedEntities[char];
      } else if ((code < 32 || code > 126) || encodeEverything) {
        encodedText += decimal ? `&#${code};` : `&#x${code.toString(16).toUpperCase()};`;
      } else if ((strict && char === '\0') || (!allowUnsafeSymbols && /[&<>"'`]/.test(char))) {
        throw new Error('Invalid character.');
      } else {
        encodedText += char;
      }
    }
    return encodedText;
  },
  decode: function(html, options = {}) {
    const isAttributeValue = options.isAttributeValue || false;
    const strict = options.strict || false;

    const namedEntities = {
      '&copy;': '©',
      '&ne;': '≠',
      '&#x1D306;': '𝌆'
    };

    return html.replace(/&(?:#x[0-9A-Fa-f]+|#[0-9]+|[a-zA-Z]+);/g, match => {
      if (namedEntities[match]) return namedEntities[match];
      
      let num;
      if (match.startsWith('&#x')) {
        num = parseInt(match.slice(3, -1), 16);
      } else if (match.startsWith('&#')) {
        num = parseInt(match.slice(2, -1), 10);
      }

      if (num && (num < 32 || num > 126)) {
        return String.fromCodePoint(num);
      } else if (strict) {
        throw new Error('Invalid character reference.');
      }
      return match;
    });
  },
  escape: function(text) {
    return text.replace(/[&<>"'`]/g, function(match) {
      switch (match) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '`': return '&#x60;';
      }
    });
  }
};

module.exports = he;
