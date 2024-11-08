'use strict';

const { hasOwnProperty } = Object.prototype;

/**
 * Safely decodes a URI-encoded string.
 *
 * @param {String} input - The URI encoded string.
 * @returns {String|null} - Decoded string or null on failure.
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/**
 * Safely encodes a string for use in a URI.
 *
 * @param {String} input - The string to encode.
 * @returns {String|null} - Encoded string or null on failure.
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch {
    return null;
  }
}

/**
 * Parses a query string into an object.
 *
 * @param {String} query - The input query string.
 * @returns {Object} - The parsed object.
 */
function parse(query) {
  const result = {};
  const parser = /([^=?#&]+)=?([^&]*)/g;
  let part;

  while ((part = parser.exec(query))) {
    const key = decode(part[1]);
    const value = decode(part[2]);

    if (key === null || value === null || hasOwnProperty.call(result, key)) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Converts an object to a query string.
 *
 * @param {Object} obj - The object to stringify.
 * @param {String} [prefix='?'] - Prefix for the query string.
 * @returns {String} - The resulting query string.
 */
function stringify(obj, prefix = '?') {
  const pairs = [];

  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      let value = obj[key];

      if (!value && (value === null || value === undefined || isNaN(value))) {
        value = '';
      }

      const encodedKey = encode(key);
      const encodedValue = encode(value);

      if (encodedKey === null || encodedValue === null) continue;
      pairs.push(`${encodedKey}=${encodedValue}`);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

// Expose the module functions
exports.stringify = stringify;
exports.parse = parse;
