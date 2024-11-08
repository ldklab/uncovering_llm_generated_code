const path = require('path');

/**
 * Checks if a character is a magic glob character.
 * @param {string} char 
 * @returns {boolean}
 */
const isMagicChar = (char) => '?*+|(){}[]!'.includes(char);

/**
 * Extracts the non-magic portion of a glob pattern to find the base path.
 * @param {string} maybeGlobString - The potential glob path.
 * @param {object} [options={}] - Configuration options.
 * @param {boolean} [options.flipBackslashes=true] - Convert backslashes to slashes.
 * @returns {string} - The base path without magic characters.
 */
function globParent(maybeGlobString, options = {}) {
  const { flipBackslashes = true } = options;

  if (flipBackslashes) {
    maybeGlobString = maybeGlobString.replace(/\\/g, '/');
  }

  let inEscape = false;
  let inBrackets = 0;
  let prev = '';
  let i = 0;

  for (i = 0; i < maybeGlobString.length; i++) {
    const char = maybeGlobString[i];

    if (char === '/' && !inBrackets && !inEscape) {
      prev = char;
      continue;
    }

    if (char === '\\' && !inEscape) {
      inEscape = true;
      continue;
    }

    if (inEscape) {
      inEscape = false;
    } else if (char === '{') {
      while (i < maybeGlobString.length && maybeGlobString[i] !== '}') i++;
    } else if (char === '[') {
      inBrackets++;
    } else if (char === ']') {
      inBrackets--;
      if (inBrackets < 0) inBrackets = 0;
    } else if (!inBrackets && isMagicChar(char)) {
      break;
    }

    prev = char;
  }

  const stripIndex = i < maybeGlobString.length ? i : undefined;
  const basePattern = stripIndex ? maybeGlobString.slice(0, stripIndex) : maybeGlobString;
  const normalizedBase = path.posix.normalize(basePattern);

  if (!normalizedBase || normalizedBase.startsWith('.')) {
    return '.';
  }

  return path.dirname(normalizedBase);
}

module.exports = globParent;
