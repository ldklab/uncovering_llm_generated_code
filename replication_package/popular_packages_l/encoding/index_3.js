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
    let buffer;
    if (typeof text === 'string') {
      buffer = Buffer.from(text, fromCharset);
    } else if (Buffer.isBuffer(text)) {
      buffer = text;
    } else {
      throw new Error('Input must be a Buffer or a String');
    }

    const decodedText = iconv.decode(buffer, fromCharset);
    const convertedBuffer = iconv.encode(decodedText, toCharset);
    return convertedBuffer;
  }
};
