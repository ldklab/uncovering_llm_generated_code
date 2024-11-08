// LZString compression and decompression library
var LZString = (function () {

  // Helper variables and functions
  const f = String.fromCharCode;
  const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  const LZString = {
    compressToBase64(input) {
      if (input == null) return "";
      const res = LZString._compress(input, 6, a => keyStrBase64.charAt(a));
      switch (res.length % 4) {
        case 0: return res;
        case 1: return res + "===";
        case 2: return res + "==";
        case 3: return res + "=";
      }
    },

    decompressFromBase64(input) {
      if (input == null || input === "") return "";
      return LZString._decompress(input.length, 32, index => getBaseValue(keyStrBase64, input.charAt(index)));
    },

    compressToUTF16(input) {
      return input == null ? "" : LZString._compress(input, 15, a => f(a + 32)) + " ";
    },

    decompressFromUTF16(compressed) {
      if (compressed == null || compressed === "") return null;
      return LZString._decompress(compressed.length, 16384, index => compressed.charCodeAt(index) - 32);
    },

    compressToUint8Array(uncompressed) {
      const compressed = LZString.compress(uncompressed);
      const buf = new Uint8Array(compressed.length * 2);
      for (let i = 0, len = compressed.length; i < len; i++) {
        const current_value = compressed.charCodeAt(i);
        buf[i * 2] = current_value >>> 8;
        buf[i * 2 + 1] = current_value % 256;
      }
      return buf;
    },

    decompressFromUint8Array(compressed) {
      if (compressed == null || compressed === undefined) {
        return LZString.decompress(compressed);
      }
      const buf = new Array(compressed.length / 2);
      for (let i = 0, len = buf.length; i < len; i++) {
        buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
      }

      let result = [];
      buf.forEach(c => result.push(f(c)));
      return LZString.decompress(result.join(''));
    },

    compressToEncodedURIComponent(input) {
      if (input == null) return "";
      return LZString._compress(input, 6, a => keyStrUriSafe.charAt(a));
    },

    decompressFromEncodedURIComponent(input) {
      if (input == null || input === "") return null;
      input = input.replace(/ /g, "+");
      return LZString._decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
    },

    compress(uncompressed) {
      return LZString._compress(uncompressed, 16, a => f(a));
    },

    _compress(uncompressed, bitsPerChar, getCharFromInt) {
      if (uncompressed == null) return "";
      const context_dictionary = {};
      const context_dictionaryToCreate = {};
      let context_c = "", context_wc = "", context_w = "",
          context_enlargeIn = 2, // Compensate for the first entry
          context_dictSize = 3, context_numBits = 2,
          context_data = [], context_data_val = 0,
          context_data_position = 0;

      for (let ii = 0; ii < uncompressed.length; ii++) {
        context_c = uncompressed.charAt(ii);
        if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
          context_dictionary[context_c] = context_dictSize++;
          context_dictionaryToCreate[context_c] = true;
        }

        context_wc = context_w + context_c;
        if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
          context_w = context_wc;
        } else {
          if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
            for (let i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            addBits(context_w, context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position);
          } else {
            const value = context_dictionary[context_w];
            addBits(value, context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position);
          }

          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }

          context_dictionary[context_wc] = context_dictSize++;
          context_w = String(context_c);
        }
      }

      if (context_w !== "") {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          for (let i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          addBits(context_w, context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position);
        } else {
          const value = context_dictionary[context_w];
          addBits(value, context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position);
        }

        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
      }

      return finalizeData(context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position);
    },

    decompress(compressed) {
      return LZString._decompress(compressed.length, 32768, index => compressed.charCodeAt(index));
    },

    _decompress(length, resetValue, getNextValue) {
      const dictionary = [0, 1, 2];
      let next, enlargeIn = 4, dictSize = 4, numBits = 3;
      let entry = "", result = [];
      let data = { val: getNextValue(0), position: resetValue, index: 1 };

      let bits = getBits(data, 2, resetValue, getNextValue);
      switch (next = bits) {
        case 0:
          entry = getChar(getBits(data, 8, resetValue, getNextValue));
          break;
        case 1:
          entry = getChar(getBits(data, 16, resetValue, getNextValue));
          break;
        case 2:
          return "";
      }

      dictionary[3] = entry;
      let w = entry;
      result.push(entry);

      while (true) {
        if (data.index > length) return "";
        bits = getBits(data, numBits, resetValue, getNextValue);
        switch (bits) {
          case 0:
            dictionary[dictSize++] = f(getBits(data, 8, resetValue, getNextValue));
            bits = dictSize - 1;
            enlargeIn--;
            break;
          case 1:
            dictionary[dictSize++] = f(getBits(data, 16, resetValue, getNextValue));
            bits = dictSize - 1;
            enlargeIn--;
            break;
          case 2:
            return result.join('');
        }

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }

        entry = dictionary[bits];
        if (!entry) {
          return (bits === dictSize) ? ((entry = w + w.charAt(0)), entry) : null;
        }
        result.push(entry);

        dictionary[dictSize++] = w + entry.charAt(0);
        enlargeIn--;

        w = entry;

        if (enlargeIn == 0) {
          enlargeIn = Math.pow(2, numBits);
          numBits++;
        }
      }
    }
  };

  function addBits(value, context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position) {
    for (let i = 0; i < 16; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position == bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }
  }

  function finalizeData(context_data, context_numBits, bitsPerChar, getCharFromInt, context_data_val, context_data_position) {
    let value = 2;
    for (let i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position == bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else context_data_position++;
    }
    return context_data.join('');
  }

  function getBits(data, maxpower, resetValue, getNextValue) {
    let bits = 0;
    let power = 1;
    const maxPower = Math.pow(2, maxpower);
    while (power != maxPower) {
      const resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    return bits;
  }

  function getChar(code) {
    return f(code);
  }

  if (typeof define === 'function' && define.amd) {
    define(() => LZString);
  } else if (typeof module !== 'undefined' && module != null) {
    module.exports = LZString;
  } else if (typeof angular !== 'undefined' && angular != null) {
    angular.module('LZString', []).factory('LZString', () => LZString);
  }

  return LZString;

})();
