'use strict';

/**
 * This module provides two functions: `escape` and `unescape`.
 * 
 * The `escape` function is used to convert special HTML characters in a string
 * to their respective HTML entities. This prevents potential security issues
 * such as XSS when inserting untrusted strings into an HTML document.
 * Characters like `&`, `<`, `>`, `"`, and `'` are replaced with their encoded
 * counterparts.
 * 
 * The `unescape` function does the opposite. It converts HTML entities back
 * into their respective characters, which is useful for decoding strings
 * that have been previously escaped for HTML.
 */

const { replace } = String.prototype;

// Regular expressions for matching HTML entities and special characters
const escapeRegex = /[&<>'"]/g;
const unescapeRegex = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;

// Mapping of characters to their HTML entities
const escapeCharsToEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

// Mapping of HTML entities to their characters
const unescapeEntitiesToChars = {
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

// Escape helper function, replaces each character with its HTML entity
const escapeReplace = match => escapeCharsToEntities[match];

/**
 * Escapes special HTML characters in a string.
 * @param {string} inputString - The string to escape.
 * @returns {string} - The escaped string.
 */
const escape = inputString => {
  if (typeof inputString !== 'string' && (typeof inputString !== 'number' && typeof inputString !== 'boolean')) {
    throw new Error('Unexpected input type');
  }
  return replace.call(String(inputString), escapeRegex, escapeReplace);
};

// Unescape helper function, replaces each HTML entity with its character
const unescapeReplace = match => unescapeEntitiesToChars[match];

/**
 * Unescapes HTML entities in a string.
 * @param {string} inputString - The string with escaped HTML entities.
 * @returns {string} - The unescaped string.
 */
const unescape = inputString => {
  if (typeof inputString !== 'string' && (typeof inputString !== 'number' && typeof inputString !== 'boolean')) {
    throw new Error('Unexpected input type');
  }
  return replace.call(String(inputString), unescapeRegex, unescapeReplace);
};

exports.escape = escape;
exports.unescape = unescape;
