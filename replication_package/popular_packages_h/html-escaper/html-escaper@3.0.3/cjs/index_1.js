'use strict';

/**
 * Copyright (C) 2017-present by Andrea Giammarchi
 *
 * This software is provided as-is, without any express or implied warranties.
 * Permission to use, copy, modify, and distribute this software is granted
 * under the terms mentioned below.
 */

const { replace } = '';

// Regular expressions for matching HTML entities
const escapeRegEx = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
const characterRegEx = /[&<>'"]/g;

// Mapping for escaping characters to HTML entities
const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;'
};

// Callback to replace characters with their HTML entity equivalents
const escapeCallback = match => escapeMap[match];

/**
 * Safely escape HTML entities in a string such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} input The string to escape
 * @returns {string} The escaped string
 */
const escapeHTML = input => replace.call(input, characterRegEx, escapeCallback);
exports.escapeHTML = escapeHTML;

// Mapping for unescaping HTML entities back to characters
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

// Callback to replace HTML entities with their character equivalents
const unescapeCallback = match => unescapeMap[match];

/**
 * Safely unescape previously escaped HTML entities such as `&`, `<`, `>`, `"`, and `'`.
 * @param {string} input The string containing escaped entities
 * @returns {string} The unescaped string
 */
const unescapeHTML = input => replace.call(input, escapeRegEx, unescapeCallback);
exports.unescapeHTML = unescapeHTML;
