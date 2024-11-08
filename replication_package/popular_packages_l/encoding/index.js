// Encoding module implementation

const iconv = require('iconv-lite');

module.exports = {
  /**
   * Convert text from one charset to another
   * @param {Buffer|String} text - Data to be converted
   * @param {String} toCharset - Target charset for conversion
   * @param {String} [fromCharset='UTF-8'] - Source charset of the data
   * @returns {Buffer} - Converted data in a Buffer
   */
  convert(text, toCharset, fromCharset = 'UTF-8') {
    if (typeof text === 'string') {
      text = Buffer.from(text, fromCharset);
    }

    if (!Buffer.isBuffer(text)) {
      throw new Error('Input text must be a Buffer or a String');
    }

    return iconv.encode(iconv.decode(text, fromCharset), toCharset);
  }
};
