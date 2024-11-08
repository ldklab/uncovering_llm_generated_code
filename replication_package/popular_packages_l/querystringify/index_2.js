'use strict';

class QueryStringHandler {
  /**
   * Convert a query string to an object.
   *
   * @param {String} queryString - Query string to be converted.
   * @returns {Object} - An object representation of the query string.
   */
  static toObject(queryString) {
    const result = {};
    // Strip leading ? or #
    queryString = queryString.replace(/^[?#]/, '');
    
    // Break down the key-value pairs.
    const keyValuePairs = queryString.split('&');
    for (const kv of keyValuePairs) {
      const [key, value = ''] = kv.split('=');
      if (key) {
        result[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    }
    return result;
  }

  /**
   * Convert an object to a query string.
   *
   * @param {Object} data - Object to be converted.
   * @param {Boolean|String} [prefix] - Query string prefix, if any.
   * @returns {String} - A stringified representation of the object.
   */
  static toQueryString(data, prefix) {
    const queryString = Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');
    
    if (!prefix) return queryString;
    return prefix === true ? `?${queryString}` : `${prefix}${queryString}`;
  }
}

module.exports = QueryStringHandler;
