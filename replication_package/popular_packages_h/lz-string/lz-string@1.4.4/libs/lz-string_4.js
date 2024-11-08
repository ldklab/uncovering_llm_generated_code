// Lempel-Ziv String Compression Implementation
const LZString = (() => {
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

  function _compress(input, bitsPerChar, getCharFromInt) {
    if (input == null) return "";
    let context_dictionary = {},
        context_dictionaryToCreate = {},
        context_w = "",
        context_enlargeIn = 2,
        context_dictSize = 3,
        context_numBits = 2,
        context_data = [],
        context_data_val = 0,
        context_data_position = 0;
    
    for (let ii = 0; ii < input.length; ii++) {
      const context_c = input.charAt(ii);
      if (!context_dictionary.hasOwnProperty(context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      const context_wc = context_w + context_c;
      if (context_dictionary.hasOwnProperty(context_wc)) {
        context_w = context_wc;
      } else {
        if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
          encodeCode(context_w, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt);
          delete context_dictionaryToCreate[context_w];
        } else {
          encodeBits(context_dictionary[context_w], bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt);
        }
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits++);
        }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = context_c;
      }
    }
    
    // Output the code for w.
    if (context_w !== "") {
      if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
        encodeCode(context_w, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt);
      } else {
        encodeBits(context_dictionary[context_w], bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt);
      }
    }
    
    // Mark the end of the stream
    encodeBits(2, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt);
    flush(context_data, bitsPerChar, context_data_position, context_data_val, getCharFromInt);
    
    return context_data.join('');
  }

  function encodeCode(char, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt) {
    if (char.charCodeAt(0) < 256) {
      processBits(8, char.charCodeAt(0));
    } else {
      processBits(16, char.charCodeAt(0));
      context_data_val = (context_data_val << 1) | 1;
    }
  }

  function processBits(size, value, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt) {
    for (let i = 0; i < size; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value >>= 1;
    }
  }

  function encodeBits(value, bitsPerChar, context_data, context_data_position, context_data_val, getCharFromInt) {
    for (let i = 0; i < 16; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value >>= 1;
    }
  }

  function flush(context_data, bitsPerChar, context_data_position, context_data_val, getCharFromInt) {
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else context_data_position++;
    }
  }

  function _decompress(length, resetValue, getNextValue) {
    let dictionary = [0, 1, 2],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        w,
        bits, resb, maxpower, power,
        c,
        data = { val: getNextValue(0), position: resetValue, index: 1 };

    while (true) {
      const result = getToken(bits, numBits, data, getNextValue, "result");
      if (result) return result;
      const entry = dictionary[c];
      dictionary[dictSize++] = w + entry.charAt(0);
      w = entry;
      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits++);
      }
    }
  }

  function getToken(bits, numBits, data, getNextValue, type) {
    let maxpower = Math.pow(2, 2);
    let power = 1;
    bits = 0;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    switch (next = bits) {
      case 0:
        const c = processNextChars(data, 8, getNextValue);
        entry = f(c);
        dictionary[3] = entry;
        w = entry;
        result.push(entry);
        break;
      case 1:
        const c2 = processNextChars(data, 16, getNextValue);
        dictionary[dictSize++] = f(c2);
        enlargeIn--;
        break;
      case 2:
        if (type === "result") return result.join('');
        break;
    }
  }

  function processNextChars(data, size, getNextValue) {
    let bits = 0;
    maxpower = Math.pow(2, size);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    return bits;
  }

  return {
    compressToBase64(input) {
      if (input == null) return "";
      const res = _compress(input, 6, a => keyStrBase64.charAt(a));
      while (res.length % 4) {
        res += '=';
      }
      return res;
    },
    decompressFromBase64(input) {
      if (input == null) return "";
      if (input === "") return null;
      return _decompress(input.length, 32, index => getBaseValue(keyStrBase64, input.charAt(index)));
    },
    compressToUTF16(input) {
      if (input == null) return "";
      return _compress(input, 15, a => f(a + 32)) + " ";
    },
    decompressFromUTF16(compressed) {
      if (compressed == null) return "";
      if (compressed === "") return null;
      return _decompress(compressed.length, 16384, index => compressed.charCodeAt(index) - 32);
    },
    compressToUint8Array(uncompressed) {
      const compressed = this.compress(uncompressed);
      const buf = new Uint8Array(compressed.length * 2);
      for (let i = 0, totalLen = compressed.length; i < totalLen; i++) {
        const currentValue = compressed.charCodeAt(i);
        buf[i * 2] = currentValue >>> 8;
        buf[i * 2 + 1] = currentValue % 256;
      }
      return buf;
    },
    decompressFromUint8Array(compressed) {
      if (!compressed) return this.decompress(compressed);
      const buf = new Array(compressed.length / 2);
      for (let i = 0, totalLen = buf.length; i < totalLen; i++) {
        buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
      }
      return this.decompress(String.fromCharCode(...buf));
    },
    compressToEncodedURIComponent(input) {
      if (input == null) return "";
      return _compress(input, 6, a => keyStrUriSafe.charAt(a));
    },
    decompressFromEncodedURIComponent(input) {
      if (input == null) return "";
      if (input === "") return null;
      input = input.replace(/ /g, "+");
      return _decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
    },
    compress(input) {
      return _compress(input, 16, a => f(a));
    },
    decompress(compressed) {
      if (compressed == null) return "";
      if (compressed === "") return null;
      return _decompress(compressed.length, 32768, index => compressed.charCodeAt(index));
    }
  };
})();

if (typeof define === 'function' && define.amd) {
  define(() => LZString);
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = LZString;
}
