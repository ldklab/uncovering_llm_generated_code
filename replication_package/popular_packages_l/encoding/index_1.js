// Charset Encoding Conversion Module

const iconv = require('iconv-lite');

module.exports = {
  /**
   * Convert data between charsets
   * @param {Buffer|String} text - Input data for conversion
   * @param {String} toCharset - Destination charset
   * @param {String} [fromCharset='UTF-8'] - Source charset (default: UTF-8)
   * @returns {Buffer} - Data converted to the target charset
   */
  convert(text, toCharset, fromCharset = 'UTF-8') {
    // Convert string to Buffer if necessary
    if (typeof text === 'string') {
      text = Buffer.from(text, fromCharset);
    }

    // Validate that input is now a Buffer
    if (!Buffer.isBuffer(text)) {
      throw new Error('Input text must be a Buffer or a String');
    }

    // Convert encoding and return
    return iconv.encode(iconv.decode(text, fromCharset), toCharset);
  }
};
