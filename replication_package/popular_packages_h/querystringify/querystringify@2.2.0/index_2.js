'use strict';

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Decode a URI encoded string.
 * @param {string} input - The URI encoded string.
 * @returns {string|null} The decoded string.
 * @private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/**
 * Encode a string into a URI component.
 * @param {string} input - The string that needs to be encoded.
 * @returns {string|null} The encoded string.
 * @private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch {
    return null;
  }
}

/**
 * Parse a query string into an object.
 * @param {string} query - The query string to be parsed.
 * @returns {Object} The resulting object.
 * @public
 */
function querystring(query) {
  const parser = /([^=?#&]+)=?([^&]*)/g;
  const result = {};
  let part;

  while ((part = parser.exec(query)) !== null) {
    const key = decode(part[1]);
    const value = decode(part[2]);

    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Convert an object to a query string.
 * @param {Object} obj - Object to convert.
 * @param {string} [prefix='?'] - Optional prefix.
 * @returns {string} The query string.
 * @public
 */
function querystringify(obj, prefix = '?') {
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

exports.stringify = querystringify;
exports.parse = querystring;
