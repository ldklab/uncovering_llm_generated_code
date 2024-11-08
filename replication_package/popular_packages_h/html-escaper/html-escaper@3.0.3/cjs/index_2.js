'use strict';

/**
 * Utility functions to escape and unescape HTML entities.
 * Provides methods to safely handle special characters such as `&`, `<`, `>`, `"`, and `'`.
 */

// Regular expressions for escaping and unescaping
const escapeRegExp = /[&<>'"]/g;
const unescapeRegExp = /&(amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;

// HTML entity mappings
const escapeChars = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

const unescapeChars = {
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&apos;': "'",
  '&#39;': "'",
  '&quot;': '"',
  '&#34;': '"'
};

// Replace function for escaping
const escapeReplace = char => escapeChars[char];

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * Converts characters such as `&`, `<`, `>`, `"`, and `'` to their HTML entity equivalents.
 * @param {string} input - The input string to escape.
 * @returns {string} - Escaped string.
 * @throws Will throw an error if the input type is not a string, boolean, or number.
 */
function escape(input) {
  if (typeof input !== 'string') input = String(input);
  return input.replace(escapeRegExp, escapeReplace);
}

// Replace function for unescaping
const unescapeReplace = entity => unescapeChars[entity];

/**
 * Unescapes a string that contains HTML entities back to normal characters.
 * Restores the original characters for `&`, `<`, `>`, `"`, and `'`.
 * @param {string} input - The input string with HTML entities.
 * @returns {string} - Unescaped string.
 * @throws Will throw an error if the input type is not a string, boolean, or number.
 */
function unescape(input) {
  if (typeof input !== 'string') input = String(input);
  return input.replace(unescapeRegExp, unescapeReplace);
}

exports.escape = escape;
exports.unescape = unescape;
