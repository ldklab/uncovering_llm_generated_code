'use strict';

class QueryStringConverter {
  /**
   * Convert a query string into an object.
   *
   * @param {String} queryString - The query string to be converted.
   * @returns {Object} - An object with decoded key-value pairs.
   */
  static parse(queryString) {
    const result = {};
    const queryWithoutPrefix = queryString.replace(/^[?#]/, '');
    const pairs = queryWithoutPrefix.split('&');

    pairs.forEach(pair => {
      const [key, value = ''] = pair.split('=');
      if (key) result[decodeURIComponent(key)] = decodeURIComponent(value);
    });

    return result;
  }

  /**
   * Convert an object into a query string.
   *
   * @param {Object} data - The object to be converted.
   * @param {Boolean|String} [prefix] - Optional prefix for the query string.
   * @returns {String} - The encoded query string.
   */
  static stringify(data, prefix) {
    const queryString = Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    if (!prefix) return queryString;
    return prefix === true ? `?${queryString}` : `${prefix}${queryString}`;
  }
}

module.exports = QueryStringConverter;
