const defaultOptions = {
  isIdentifier: false,
  quotes: 'single',
  wrap: false,
  escapeEverything: false,
};

function toHex(character) {
  return character.charCodeAt(0).toString(16).toUpperCase();
}

function escapeCharacter(character, options) {
  if (options.escapeEverything) {
    const hex = toHex(character);
    return `\\${hex.length === 1 ? '0' : ''}${hex} `;
  }
  // Escape non-ASCII characters
  if (character.charCodeAt(0) > 0x7F) {
    const hex = toHex(character);
    return `\\${hex} `;
  }
  switch (character) {
    case '\0':
      return '\\0 ';
    case '\b':
    case '\v':
    case '\t':
    case '\r':
    case '\f':
      return `\\${character.charCodeAt(0).toString(16)} `;
    case '\n':
      return '\\A ';
    case '\u0000':
      return '\\0 ';
    case '\u000C':
      return '\\c ';
    case '"':
      return options.quotes === 'double' ? `\\"` : '"';
    case '\'':
      return options.quotes === 'single' ? `\\'` : '\'';
    case ' ':
      return '\\ ';
    default:
      if (!character.match(/[ -~]/)) {
        const hex = toHex(character);
        return `\\${hex.length === 1 ? '0' : ''}${hex} `;
      }
      return character;
  }
}

function cssesc(input, options = {}) {
  // Merge default options with user-provided options
  options = { ...defaultOptions, ...options };

  let escaped = Array.from(input, character => escapeCharacter(character, options)).join('');

  if (options.wrap) {
    const quote = options.quotes === 'double' ? '"' : '\'';
    escaped = `${quote}${escaped}${quote}`;
  }

  // Handle CSS identifiers
  if (options.isIdentifier) {
    // Ensure starting character is legal in identifiers
    if (/^[0-9]/.test(escaped)) {
      escaped = `\\3${escaped.charAt(0)}${escaped.slice(1)}`;
    }
  }

  return escaped;
}

// Expose options object and version
cssesc.options = { ...defaultOptions };
cssesc.version = '1.0.0';

if (require.main === module) {
  // Simple CLI support
  const input = process.argv.slice(2).join(' ');
  console.log(cssesc(input, { wrap: true }));
}

module.exports = cssesc;
