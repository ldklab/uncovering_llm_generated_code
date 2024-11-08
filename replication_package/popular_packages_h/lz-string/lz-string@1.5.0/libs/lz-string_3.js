// LZ-based compression algorithm, version 1.4.5
// License: WTFPL v2
var LZString = (function() {
  const f = String.fromCharCode;
  const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  let baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  }

  const compressBase = (input, bitLength, charToInt) => {
    if (input == null) return "";
    let context_dictionary = {};
    let context_dictionaryToCreate = {};
    let context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;
    let context_enlargeIn = 2;
    let context_dictSize = 3;
    let context_numBits = 2;
    let context_w = "";
    let context_wc = "";

    for (let ii = 0; ii < input.length; ii++) {
      let context_c = input.charAt(ii);
      if (!context_dictionary.hasOwnProperty(context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (context_dictionary.hasOwnProperty(context_wc)) {
        context_w = context_wc;
      } else {
        handleContext(context_w, bitLength);
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    if (context_w !== "") {
      handleContext(context_w, bitLength);
    }

    // Mark the end of the stream
    handleContext(2, bitLength);

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitLength - 1) {
        context_data.push(charToInt(context_data_val));
        break;
      } else context_data_position++;
    }

    return context_data.join('');

    function handleContext(context_w, bitsPerChar) {
      let value;
      if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (let i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(charToInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (let i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(charToInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (let i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(charToInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (let i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(charToInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (let i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(charToInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      }
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }
  };

  const decompressBase = (compressed, resetVal, nextValFunc) => {
    let dictionary = [];
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = "";
    let result = [];
    let data = { val: nextValFunc(0), position: resetVal, index: 1 };

    for (let i = 0; i < 3; i++) dictionary[i] = i;

    let bits = 0, maxpower = Math.pow(2, 2), power = 1;
    while (power !== maxpower) {
      let resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetVal;
        data.val = nextValFunc(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    let next = bits;
    switch (next) {
      case 0: bits = fetchBits(8); break;
      case 1: bits = fetchBits(16); break;
      case 2: return ""; 
    }

    let w = dictionary[3] = f(bits);
    result.push(w);
    while (true) {
      if (data.index > compressed.length) return "";
      bits = fetchBits(numBits);
      let c;
      switch (c = bits) {
        case 0: bits = fetchBits(8); dictionary[dictSize++] = f(bits); c = dictSize - 1; enlargeIn--; break;
        case 1: bits = fetchBits(16); dictionary[dictSize++] = f(bits); c = dictSize - 1; enlargeIn--; break;
        case 2: return result.join(''); 
      }

      handleExpand();
    }

    function fetchBits(bitCount) {
      let bits = 0, power = 1;
      let maxpower = Math.pow(2, bitCount);
      while (power !== maxpower) {
        let resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetVal;
          data.val = nextValFunc(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      return bits;
    }

    function handleExpand() {
      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  };

  const LZString = {
    compressToBase64(input) {
      if (input == null) return "";
      let res = compressBase(input, 6, (a) => keyStrBase64.charAt(a));
      return res.padEnd(res.length + (4 - res.length % 4) % 4, '=');
    },
    decompressFromBase64(input) {
      if (input == null || input === "") return null;
      return decompressBase(input.length, 32, (index) => getBaseValue(keyStrBase64, input.charAt(index)));
    },
    compressToUTF16(input) {
      if (input == null) return "";
      return compressBase(input, 15, (a) => f(a + 32)) + " ";
    },
    decompressFromUTF16(compressed) {
      if (compressed == null || compressed === "") return null;
      return decompressBase(compressed.length, 16384, (index) => compressed.charCodeAt(index) - 32);
    },
    compressToUint8Array(uncompressed) {
      let compressed = LZString.compress(uncompressed);
      let buf = new Uint8Array(compressed.length * 2);

      for (let i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
        let current_value = compressed.charCodeAt(i);
        buf[i * 2] = current_value >>> 8;
        buf[i * 2 + 1] = current_value % 256;
      }
      return buf;
    },
    decompressFromUint8Array(compressed) {
      if (compressed == null || compressed === undefined) {
        return LZString.decompress(compressed);
      }
      let buf = new Array(compressed.length / 2);
      for (let i = 0, TotalLen = buf.length; i < TotalLen; i++) {
        buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
      }

      return LZString.decompress(buf.map((c) => f(c)).join(''));
    },
    compressToEncodedURIComponent(input) {
      if (input == null) return "";
      return compressBase(input, 6, (a) => keyStrUriSafe.charAt(a));
    },
    decompressFromEncodedURIComponent(input) {
      if (input == null || input === "") return null;
      return decompressBase(input.replace(/ /g, "+").length, 32, (index) => getBaseValue(keyStrUriSafe, input.charAt(index)));
    },
    compress(uncompressed) {
      return compressBase(uncompressed, 16, f);
    },
    decompress(compressed) {
      if (compressed == null || compressed === "") return null;
      return decompressBase(compressed.length, 32768, (index) => compressed.charCodeAt(index));
    },
  };

  return LZString;
})();

if (typeof define === 'function' && define.amd) {
  define(() => LZString);
} else if (typeof module !== 'undefined' && module != null) {
  module.exports = LZString;
} else if (typeof angular !== 'undefined' && angular != null) {
  angular.module('LZString', []).factory('LZString', () => LZString);
}
