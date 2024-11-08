const path = require('path');

/**
 * Checks if a character is a glob magic character.
 * @param {string} char - Character to check.
 * @returns {boolean}
 */
const isMagicChar = (char) => '?*+|(){}[]!'.includes(char);

/**
 * Extracts the base path from a glob pattern, removing magic parts.
 * @param {string} maybeGlobString - The input string which may include glob patterns.
 * @param {object} [options={}] - Configuration options.
 * @param {boolean} [options.flipBackslashes=true] - Convert backslashes to forward slashes.
 * @returns {string} - Non-magic parent path.
 */
function globParent(maybeGlobString, options = {}) {
  const { flipBackslashes = true } = options;

  if (flipBackslashes) {
    maybeGlobString = maybeGlobString.replace(/\\/g, '/');
  }

  let inEscape = false;
  let inBrackets = 0;
  let prevChar = '';
  let i = 0;

  for (i = 0; i < maybeGlobString.length; i++) {
    const char = maybeGlobString[i];

    if (char === '/' && !inBrackets && !inEscape) {
      prevChar = char;
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

    prevChar = char;
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
