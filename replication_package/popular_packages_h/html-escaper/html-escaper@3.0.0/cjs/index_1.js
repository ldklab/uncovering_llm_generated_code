'use strict';

/**
 * This code provides two main functionalities: escaping and unescaping HTML entities in a string.
 * The functions are designed to replace special XML/HTML characters with their respective character entities and vice versa.
 * It exports two functions allowing consumer code to safely manage string content that may contain HTML records.
 */

// Character entities mapping for escaping and unescaping
const escapeEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

const unescapeEntities = {
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

// Regular expressions for matching the characters
const escapeRegex = /[&<>'"]/g;
const unescapeRegex = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;

// Helper function to get the escaped value of a character match
const escapeMapper = match => escapeEntities[match];

// Main function to escape special characters in a string
const escape = str => {
  return str.replace(escapeRegex, escapeMapper);
};

// Export the escape function
exports.escape = escape;

// Helper function to get the unescaped value of a character entity match
const unescapeMapper = match => unescapeEntities[match];

// Main function to unescape previously escaped character entities in a string
const unescape = str => {
  return str.replace(unescapeRegex, unescapeMapper);
};

// Export the unescape function
exports.unescape = unescape;
