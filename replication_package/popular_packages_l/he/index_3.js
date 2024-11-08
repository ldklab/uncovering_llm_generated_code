markdown
// he.js

const he = {
  version: '1.0.0',

  encode(text, options = {}) {
    const {
      useNamedReferences = false,
      decimal = false,
      encodeEverything = false,
      strict = false,
      allowUnsafeSymbols = false
    } = options;

    const namedEntities = {
      '©': '&copy;',
      '≠': '&ne;',
      '𝌆': '&#x1D306;'
    };

    return [...text].map(char => {
      let code = char.codePointAt(0);
      if (useNamedReferences && namedEntities[char]) {
        return namedEntities[char];
      }
      if (encodeEverything || code < 32 || code > 126) {
        return decimal ? `&#${code};` : `&#x${code.toString(16).toUpperCase()};`;
      }
      if (strict && char === '\0' || !allowUnsafeSymbols && /[&<>"'`]/.test(char)) {
        throw new Error('Invalid character.');
      }
      return char;
    }).join('');
  },

  decode(html, options = {}) {
    const { strict = false } = options;

    const namedEntities = {
      '&copy;': '©',
      '&ne;': '≠',
      '&#x1D306;': '𝌆'
    };

    return html.replace(/&(?:#x[0-9A-Fa-f]+|#[0-9]+|[a-zA-Z]+);/g, match => {
      if (namedEntities[match]) return namedEntities[match];

      if (match.startsWith('&#x')) {
        let num = parseInt(match.slice(3, -1), 16);
        if (num && (num < 32 || num > 126)) return String.fromCodePoint(num);
      } else if (match.startsWith('&#')) {
        let num = parseInt(match.slice(2, -1), 10);
        if (num && (num < 32 || num > 126)) return String.fromCodePoint(num);
      }

      if (strict) throw new Error('Invalid character reference.');
      return match;
    });
  },

  escape(text) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;'
    };

    return text.replace(/[&<>"'`]/g, char => escapeMap[char]);
  }
};

module.exports = he;
