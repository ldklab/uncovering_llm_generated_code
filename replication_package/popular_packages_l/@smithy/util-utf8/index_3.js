// utf8-utils.js

class Utf8Utils {
  /**
   * Encodes a given string into a UTF-8 byte array.
   * @param {string} str - The input string to encode.
   * @returns {Uint8Array} - The UTF-8 encoded byte array.
   */
  static encode(str) {
    const utf8Bytes = [];
    for (const char of str) {
      const code = char.codePointAt(0);
      if (code < 0x80) {
        utf8Bytes.push(code);
      } else if (code < 0x800) {
        utf8Bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0x10000) {
        utf8Bytes.push(
          0xe0 | (code >> 12),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        );
      } else {
        utf8Bytes.push(
          0xf0 | (code >> 18),
          0x80 | ((code >> 12) & 0x3f),
          0x80 | ((code >> 6) & 0x3f),
          0x80 | (code & 0x3f)
        );
      }
    }
    return new Uint8Array(utf8Bytes);
  }

  /**
   * Decodes a UTF-8 byte array back into a string.
   * @param {Uint8Array} bytes - The UTF-8 byte array to decode.
   * @returns {string} - The decoded string.
   */
  static decode(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; ) {
      const byte1 = bytes[i++];
      if (byte1 < 0x80) {
        str += String.fromCharCode(byte1);
      } else if (byte1 < 0xe0) {
        const byte2 = bytes[i++];
        str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
      } else if (byte1 < 0xf0) {
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        str += String.fromCharCode(
          ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
        );
      } else {
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        const byte4 = bytes[i++];
        const codePoint =
          ((byte1 & 0x07) << 18) |
          ((byte2 & 0x3f) << 12) |
          ((byte3 & 0x3f) << 6) |
          (byte4 & 0x3f) -
          0x10000;
        str += String.fromCharCode(
          (codePoint >> 10) + 0xd800,
          (codePoint & 0x3ff) + 0xdc00
        );
      }
    }
    return str;
  }
}

module.exports = Utf8Utils;
