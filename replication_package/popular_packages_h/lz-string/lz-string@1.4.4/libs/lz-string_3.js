// LZ-based compression algorithm, version 1.4.4
const LZString = (() => {

  const f = String.fromCharCode;
  const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  let baseReverseDic = {};

  const getBaseValue = (alphabet, character) => {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) {
        baseReverseDic[alphabet][alphabet.charAt(i)] = i;
      }
    }
    return baseReverseDic[alphabet][character];
  };

  const _compress = (uncompressed, bitsPerChar, getCharFromInt) => {
    if (uncompressed == null) return "";
    let context_dictionary = {};
    let context_dictionaryToCreate = {};
    let context_c = "", context_wc = "", context_w = "";
    let context_enlargeIn = 2;
    let context_dictSize = 3;
    let context_numBits = 2;
    let context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;

    for (let ii = 0; ii < uncompressed.length; ii++) {
      context_c = uncompressed.charAt(ii);
      if (!context_dictionary.hasOwnProperty(context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (context_dictionary.hasOwnProperty(context_wc)) {
        context_w = context_wc;
      } else {
        if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
          if (context_w.charCodeAt(0) < 256) {
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
            let value = context_w.charCodeAt(0);
            for (let i = 0; i < 8; i++) {
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
          } else {
            let value = 1;
            for (let i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
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
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          let value = context_dictionary[context_w];
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
      if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
        if (context_w.charCodeAt(0) < 256) {
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
          let value = context_w.charCodeAt(0);
          for (let i = 0; i < 8; i++) {
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
        } else {
          let value = 1;
          for (let i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
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
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        let value = context_dictionary[context_w];
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
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }
    
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
  };

  const _decompress = (length, resetValue, getNextValue) => {
    let dictionary = [];
    let next, enlargeIn = 4, dictSize = 4;
    let numBits = 3, entry = "", result = [];
    let data = { val: getNextValue(0), position: resetValue, index: 1 };

    for (let i = 0; i < 3; i++) {
      dictionary[i] = i;
    }

    let bits = 0, maxpower = Math.pow(2, 2), power = 1;
    while (power != maxpower) {
      let resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    let c;
    switch (next = bits) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power != maxpower) {
          let resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = f(bits);
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power != maxpower) {
          let resb = data.val & data.position;
          data.position >>= 1;
          if (data.position == 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    let w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }
      
      bits = 0, maxpower = Math.pow(2, numBits), power = 1;
      while (power != maxpower) {
        let resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      
      let c;
      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power != maxpower) {
            let resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power != maxpower) {
            let resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }
      
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

      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  };

  const compress = (uncompressed) => _compress(uncompressed, 16, a => f(a));
  const decompress = (compressed) => {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return _decompress(compressed.length, 32768, index => compressed.charCodeAt(index));
  };

  return {
    compressToBase64: (input) => {
      if (input == null) return "";
      const res = _compress(input, 6, a => keyStrBase64.charAt(a));
      switch (res.length % 4) {
        default: return res;
        case 0: return res;
        case 1: return res + "===";
        case 2: return res + "==";
        case 3: return res + "=";
      }
    },
    decompressFromBase64: (input) => {
      if (input == null) return "";
      if (input == "") return null;
      return _decompress(input.length, 32, index => getBaseValue(keyStrBase64, input.charAt(index)));
    },
    compressToUTF16: (input) => {
      if (input == null) return "";
      return _compress(input, 15, a => f(a + 32)) + " ";
    },
    decompressFromUTF16: (compressed) => {
      if (compressed == null) return "";
      if (compressed == "") return null;
      return _decompress(compressed.length, 16384, index => compressed.charCodeAt(index) - 32);
    },
    compressToUint8Array: (uncompressed) => {
      const compressed = compress(uncompressed);
      const buf = new Uint8Array(compressed.length * 2);
      for (let i = 0, totalLen = compressed.length; i < totalLen; i++) {
        const currentValue = compressed.charCodeAt(i);
        buf[i * 2] = currentValue >>> 8;
        buf[i * 2 + 1] = currentValue % 256;
      }
      return buf;
    },
    decompressFromUint8Array: (compressed) => {
      if (compressed === null || compressed === undefined) {
        return decompress(compressed);
      } else {
        const buf = new Array(compressed.length / 2);
        for (let i = 0, totalLen = buf.length; i < totalLen; i++) {
          buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
        }
        const result = [];
        buf.forEach(c => result.push(f(c)));
        return decompress(result.join(''));
      }
    },
    compressToEncodedURIComponent: (input) => {
      if (input == null) return "";
      return _compress(input, 6, a => keyStrUriSafe.charAt(a));
    },
    decompressFromEncodedURIComponent: (input) => {
      if (input == null) return "";
      if (input == "") return null;
      input = input.replace(/ /g, "+");
      return _decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
    },
    compress,
    decompress
  };
})();

if (typeof define === 'function' && define.amd) {
  define(() => LZString);
} else if (typeof module !== 'undefined' && module != null) {
  module.exports = LZString;
}
