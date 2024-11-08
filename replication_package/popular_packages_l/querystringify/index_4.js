'use strict';

class QueryStringify {
  /**
   * Converts a query string into an object representation.
   *
   * @param {String} query - The query string to transform.
   * @returns {Object} - An object containing key-value pairs from the query string.
   */
  static parse(query) {
    const result = {};
    query.replace(/^[?#]/, '') // Strip leading '?' or '#'
      .split('&')
      .forEach(pair => {
        const [key, value = ''] = pair.split('=');
        if (key) result[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    return result;
  }

  /**
   * Converts an object into a query string with optional prefix.
   *
   * @param {Object} obj - The object to convert into a query string.
   * @param {Boolean|String} [prefix] - Optional prefix to prepend to the query string.
   * @returns {String} - The resulting query string with optional prefix.
   */
  static stringify(obj, prefix) {
    const queryString = Object.entries(obj)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    if (prefix === true) return `?${queryString}`;
    if (typeof prefix === 'string') return `${prefix}${queryString}`;

    return queryString;
  }
}

module.exports = QueryStringify;
