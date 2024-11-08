// Module for converting text encodings

const iconv = require('iconv-lite');

module.exports = {
  /**
   * Converts text encoding from one charset to another
   * @param {Buffer|String} text - The input text to convert
   * @param {String} toCharset - The character set to convert text into
   * @param {String} [fromCharset='UTF-8'] - The original character set of the text
   * @returns {Buffer} - A Buffer containing the converted text
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
