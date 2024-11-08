'use strict';

const DEFAULT_OPTIONS = {
  escapeEverything: false,
  isIdentifier: false,
  quotes: 'single',
  wrap: false
};

const regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
const regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
const regexAlwaysEscape = /['"\\]/;
const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

/**
 * Merges user options with default options.
 * @param {Object} [options={}] - User-supplied options.
 * @param {Object} defaults - Default options.
 * @returns {Object} Merged options object.
 */
function mergeOptions(options = {}, defaults) {
  return { ...defaults, ...options };
}

/**
 * Escapes a string for use in CSS.
 * @param {string} string - The input string to escape.
 * @param {Object} [options] - Configuration options for escaping.
 * @returns {string} The escaped string.
 */
function cssesc(string, options) {
  options = mergeOptions(options, DEFAULT_OPTIONS);
  const quote = options.quotes === 'double' ? '"' : "'";
  const isIdentifier = options.isIdentifier;
  
  let output = '';
  let counter = 0;
  const length = string.length;

  while (counter < length) {
    let character = string.charAt(counter++);
    let codePoint = character.charCodeAt();
    let value;

    if (codePoint < 0x20 || codePoint > 0x7E) {
      if (0xD800 <= codePoint && codePoint <= 0xDBFF && counter < length) {
        const extra = string.charCodeAt(counter++);
        if ((extra & 0xFC00) === 0xDC00) {
          codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
        } else {
          counter--;
        }
      }
      value = '\\' + codePoint.toString(16).toUpperCase() + ' ';
    } else {
      if (options.escapeEverything) {
        value = regexAnySingleEscape.test(character) ? '\\' + character : '\\' + codePoint.toString(16).toUpperCase() + ' ';
      } else if (/[\t\n\f\r\x0B]/.test(character) || 
                (!isIdentifier && (character === quote) || 
                (character === '\\' || (isIdentifier && regexSingleEscape.test(character))))) {
        value = '\\' + character;
      } else {
        value = character;
      }
    }
    output += value;
  }

  if (isIdentifier) {
    if (/^-[-\d]/.test(output)) {
      output = '\\-' + output.slice(1);
    } else if (/\d/.test(string.charAt(0))) {
      output = '\\3' + string.charAt(0) + ' ' + output.slice(1);
    }
  }

  output = output.replace(regexExcessiveSpaces, ($0, $1, $2) => {
    return ($1 && $1.length % 2) ? $0 : ($1 || '') + $2;
  });

  if (!isIdentifier && options.wrap) {
    return quote + output + quote;
  }

  return output;
}

cssesc.version = '3.0.0';
module.exports = cssesc;
