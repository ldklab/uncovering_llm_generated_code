'use strict';

/**
 * This code provides two main functions, escape and unescape, to handle the conversion of special HTML characters.
 * escape: Converts special characters in a string to their respective HTML entities.
 * unescape: Converts HTML entities back to their respective characters.
 */

// Define string replace variable for calling string replacement functionality
const { replace } = '';

// Regular expression for matching HTML entities
const es = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
// Regular expression for matching characters that need to be escaped
const ca = /[&<>'"]/g;

// Map of characters to their escaped HTML entities
const esca = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

// Function to get escaped HTML entity for a character
const pe = m => esca[m];

// Function to escape special HTML characters in a string
const escape = es => replace.call(es, ca, pe);
exports.escape = escape;

// Map of HTML entities to their corresponding characters
const unes = {
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

// Function to get character for an HTML escaped entity
const cape = m => unes[m];

// Function to unescape HTML entities in a string back to normal characters
const unescape = un => replace.call(un, es, cape);
exports.unescape = unescape;
