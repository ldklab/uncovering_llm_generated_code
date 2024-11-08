const path = require('path');

/**
 * Checks if a character is considered magic in glob patterns.
 * @param {string} char - Character to check.
 * @returns {boolean} - True if the character is magic, false otherwise.
 */
const isMagicChar = (char) => '?*+|(){}[]!'.includes(char);

/**
 * Extracts the non-magic part of a glob string or path.
 * @param {string} maybeGlobString - Input path or glob pattern.
 * @param {object} [options={}] - Configuration options.
 * @param {boolean} [options.flipBackslashes=true] - Converts backslashes to forward slashes if true.
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
