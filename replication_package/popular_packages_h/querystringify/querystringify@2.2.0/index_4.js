'use strict';

const has = Object.prototype.hasOwnProperty;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  const parser = /([^=?#&]+)=?([^&]*)/g;
  const result = {};
  let part;

  while (part = parser.exec(query)) {
    const key = decode(part[1]);
    const value = decode(part[2]);

    // Prevent property overriding and omit failed decodings
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix = '?') {
  const pairs = [];

  for (let key in obj) {
    if (has.call(obj, key)) {
      let value = obj[key];

      // Encode value to an empty string for certain edge cases
      if (!value && (value === null || value === undefined || isNaN(value))) {
        value = '';
      }

      key = encode(key);
      value = encode(value);

      // Skip if encoding fails
      if (key === null || value === null) continue;
      pairs.push(`${key}=${value}`);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

// Expose the module
exports.stringify = querystringify;
exports.parse = querystring;
