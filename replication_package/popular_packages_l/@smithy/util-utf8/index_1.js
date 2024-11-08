// utf8-util.js

class Utf8Util {
  /**
   * Encodes a string into a UTF-8 byte array.
   * @param {string} str - The string to encode.
   * @returns {Uint8Array} - The encoded UTF-8 byte array.
   */
  static encode(str) {
    const utf8Bytes = [];
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (charCode < 0x80) {
        utf8Bytes.push(charCode);
      } else if (charCode < 0x800) {
        utf8Bytes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        utf8Bytes.push(
          0xe0 | (charCode >> 12),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f)
        );
      } else {
        i++;
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8Bytes.push(
          0xf0 | (charCode >> 18),
          0x80 | ((charCode >> 12) & 0x3f),
          0x80 | ((charCode >> 6) & 0x3f),
          0x80 | (charCode & 0x3f)
        );
      }
    }
    return new Uint8Array(utf8Bytes);
  }

  /**
   * Decodes a UTF-8 byte array into a string.
   * @param {Uint8Array} bytes - The byte array to decode.
   * @returns {string} - The resulting string.
   */
  static decode(bytes) {
    let result = "";
    let i = 0;
    while (i < bytes.length) {
      let byte1 = bytes[i++];
      if (byte1 < 0x80) {
        result += String.fromCharCode(byte1);
      } else if (byte1 < 0xe0) {
        const byte2 = bytes[i++];
        result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
      } else if (byte1 < 0xf0) {
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        result += String.fromCharCode(
          ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
        );
      } else {
        const byte2 = bytes[i++];
        const byte3 = bytes[i++];
        const byte4 = bytes[i++];
        const charCode = ((byte1 & 0x07) << 18) | ((byte2 & 0x3f) << 12) |
                         ((byte3 & 0x3f) << 6) | (byte4 & 0x3f) - 0x10000;
        result += String.fromCharCode((charCode >> 10) + 0xd800) +
                  String.fromCharCode((charCode & 0x3ff) + 0xdc00);
      }
    }
    return result;
  }
}

module.exports = Utf8Util;
