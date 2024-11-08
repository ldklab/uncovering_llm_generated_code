'use strict';

class QueryStringify {
  /**
   * Parse a query string into an object.
   *
   * @param {String} query - The query string to parse.
   * @returns {Object} - The resulting object with key-value pairs.
   */
  static parse(query) {
    const object = {};
    // Remove leading ? or #
    query = query.replace(/^[?#]/, '');

    // Split the query string into key-value pairs.
    const pairs = query.split('&');
    for (const pair of pairs) {
      const [key, value = ''] = pair.split('=');
      if (key) object[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return object;
  }

  /**
   * Stringify an object into a query string.
   *
   * @param {Object} obj - The object to stringify.
   * @param {Boolean|String} [prefix] - Boolean or string to prefix the query.
   * @returns {String} - The resulting query string.
   */
  static stringify(obj, prefix) {
    const str = Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');

    if (!prefix) return str;
    if (prefix === true) return `?${str}`;
    
    return `${prefix}${str}`;
  }
}

module.exports = QueryStringify;
