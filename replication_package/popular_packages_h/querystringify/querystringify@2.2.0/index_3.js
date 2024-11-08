'use strict';

const hasOwn = Object.prototype.hasOwnProperty;

/**
 * Decodes a URI component, replacing '+' with spaces.
 *
 * @param {String} input URI encoded string.
 * @returns {String|null} Decoded string or null on failure.
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

/**
 * Encodes a string with URI encoding.
 *
 * @param {String} input String to encode.
 * @returns {String|null} Encoded URI component or null on failure.
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
 * @param {String} query Query string to parse.
 * @returns {Object} Parsed key-value object.
 */
function querystring(query) {
  const regex = /([^=?#&]+)=?([^&]*)/g;
  const result = {};
  let match;

  while ((match = regex.exec(query))) {
    const key = decode(match[1]);
    const value = decode(match[2]);

    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Converts an object to a query string with an optional prefix.
 *
 * @param {Object} obj Object to stringify.
 * @param {String} [prefix='?'] Optional prefix.
 * @returns {String} Query string.
 */
function querystringify(obj, prefix = '?') {
  const pairs = [];

  for (const key in obj) {
    if (hasOwn.call(obj, key)) {
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

module.exports = {
  stringify: querystringify,
  parse: querystring
};
