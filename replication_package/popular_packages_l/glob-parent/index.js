const path = require('path');

/**
 * Determines if the given character is a magic character used in glob patterns.
 * @param {string} char 
 * @returns {boolean}
 */
const isMagicChar = (char) => '?*+|(){}[]!'.includes(char);

/**
 * Extracts the non-magic parent path from a glob string.
 * @param {string} maybeGlobString - The glob pattern or path.
 * @param {object} [options={}] - Optional settings.
 * @param {boolean} [options.flipBackslashes=true] - Flip backslashes in paths (typically for Windows).
 * @returns {string} - The non-magic parent path.
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
  const basePath = stripIndex ? maybeGlobString.slice(0, stripIndex) : maybeGlobString;
  const normalizedPath = path.posix.normalize(basePath);

  if (!normalizedPath || normalizedPath.startsWith('.')) {
    return '.';
  }

  return path.dirname(normalizedPath);
}

module.exports = globParent;
