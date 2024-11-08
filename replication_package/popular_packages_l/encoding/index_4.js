// Encoding module implementation

const iconv = require('iconv-lite');

module.exports = {
  /**
   * Converts text from one character encoding to another.
   * 
   * @param {Buffer|string} input - The data to convert.
   * @param {string} targetCharset - The charset to convert the data to.
   * @param {string} [sourceCharset='UTF-8'] - The charset of the input data.
   * @returns {Buffer} - The data converted to the target charset.
   * @throws {Error} Throws an error if the input is neither a Buffer nor a string.
   */
  convert(input, targetCharset, sourceCharset = 'UTF-8') {
    let bufferInput;

    if (typeof input === 'string') {
      bufferInput = Buffer.from(input, sourceCharset);
    } else if (Buffer.isBuffer(input)) {
      bufferInput = input;
    } else {
      throw new Error('Input must be a Buffer or a String');
    }

    const decodedText = iconv.decode(bufferInput, sourceCharset);
    const encodedBuffer = iconv.encode(decodedText, targetCharset);

    return encodedBuffer;
  }
};
