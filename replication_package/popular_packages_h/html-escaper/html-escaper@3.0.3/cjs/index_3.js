'use strict';
/**
 * This code provides utility functions to safely escape and unescape HTML 
 * entities in a given string. These functions handle characters like `&`, `<`, 
 * `>`, `"`, and `'` to convert them to their corresponding HTML entities and 
 * vice versa. This is particularly useful for preventing XSS attacks when 
 * dynamically inserting strings into web pages.
 */

// Regular expressions to match escaped and unescaped HTML entities
const escapedEntitiesRegex = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
const charactersToEscapeRegex = /[&<>'"]/g;

// Maps for escaping and unescaping HTML entities
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

const unescapeMap = {
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

// Function used to replace each character using escapeMap
const escapeReplacer = match => escapeMap[match];

/**
 * Safely escape HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} input The input string to safely escape.
 * @returns {string} The escaped input, and it throws an error if
 * the input type is unexpected, except for boolean and numbers,
 * converted as strings.
 */
const escape = input => {
  if (typeof input !== 'string' && typeof input !== 'boolean' && typeof input !== 'number') {
    throw new Error('Invalid input type');
  }
  return String(input).replace(charactersToEscapeRegex, escapeReplacer);
};

// Function used to replace each escaped entity using unescapeMap
const unescapeReplacer = match => unescapeMap[match];

/**
 * Safely unescape previously escaped entities such as `&`, `<`, `>`, `"`,
 * and `'`.
 * @param {string} input A previously escaped string.
 * @returns {string} The unescaped input, and it throws an error if
 * the input type is unexpected, except for boolean and numbers,
 * converted as strings.
 */
const unescape = input => {
  if (typeof input !== 'string' && typeof input !== 'boolean' && typeof input !== 'number') {
    throw new Error('Invalid input type');
  }
  return String(input).replace(escapedEntitiesRegex, unescapeReplacer);
};

// Export the escape and unescape functions
exports.escape = escape;
exports.unescape = unescape;
