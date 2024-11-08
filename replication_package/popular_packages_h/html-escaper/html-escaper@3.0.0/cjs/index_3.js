'use strict';

/**
 * Provides utility functions to escape and unescape HTML entities in strings.
 */

// Regular expression to find characters to escape in HTML
const escapeCharsRegex = /[&<>'"]/g;
// Mapping from characters to their HTML escape equivalents
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

// Function to perform the replacement for escaping
const escapeReplacement = match => escapeMap[match];

// Function to escape characters in a string to their HTML entities
const escape = (inputString) => inputString.replace(escapeCharsRegex, escapeReplacement);
exports.escape = escape;

// Regular expression to find escaped HTML entities
const unescapeEntitiesRegex = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
// Mapping from HTML escape entities to their character equivalents
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

// Function to perform the replacement for unescaping
const unescapeReplacement = match => unescapeMap[match];

// Function to unescape HTML entities in a string back to characters
const unescape = (escapedString) => escapedString.replace(unescapeEntitiesRegex, unescapeReplacement);
exports.unescape = unescape;
