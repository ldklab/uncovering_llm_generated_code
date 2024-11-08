// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.4
(function(global) {
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
      let res = LZString._compress(input, 6, a => keyStrBase64.charAt(a));
      switch (res.length % 4) {
        case 0: return res;
        case 1: return res + "===";
        case 2: return res + "==";
        case 3: return res + "=";
      }
    },

    decompressFromBase64(input) {
      if (input == null) return "";
      if (input == "") return null;
      return LZString._decompress(input.length, 32, index => getBaseValue(keyStrBase64, input.charAt(index)));
    },

    compressToUTF16(input) {
      if (input == null) return "";
      return LZString._compress(input, 15, a => f(a + 32)) + " ";
    },

    decompressFromUTF16(compressed) {
      if (compressed == null) return "";
      if (compressed == "") return null;
      return LZString._decompress(compressed.length, 16384, index => compressed.charCodeAt(index) - 32);
    },

    compressToUint8Array(uncompressed) {
      const compressed = LZString.compress(uncompressed);
      const buf = new Uint8Array(compressed.length * 2);

      for (let i = 0, len = compressed.length; i < len; i++) {
        const currentValue = compressed.charCodeAt(i);
        buf[i * 2] = currentValue >>> 8;
        buf[i * 2 + 1] = currentValue % 256;
      }
      return buf;
    },

    decompressFromUint8Array(compressed) {
      if (compressed === null || compressed === undefined) {
        return LZString.decompress(compressed);
      } else {
        const buf = new Array(compressed.length / 2);
        for (let i = 0, len = buf.length; i < len; i++) {
          buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
        }

        return LZString.decompress(buf.map(f).join(''));
      }
    },

    compressToEncodedURIComponent(input) {
      if (input == null) return "";
      return LZString._compress(input, 6, a => keyStrUriSafe.charAt(a));
    },

    decompressFromEncodedURIComponent(input) {
      if (input == null) return "";
      if (input == "") return null;
      input = input.replace(/ /g, "+");
      return LZString._decompress(input.length, 32, index => getBaseValue(keyStrUriSafe, input.charAt(index)));
    },

    compress(uncompressed) {
      return LZString._compress(uncompressed, 16, a => f(a));
    },

    _compress(uncompressed, bitsPerChar, getCharFromInt) {
      if (uncompressed == null) return "";

      let context_dictionary = {},
          context_dictionaryToCreate = {},
          context_c = "",
          context_wc = "",
          context_w = "",
          context_enlargeIn = 2,
          context_dictSize = 3,
          context_numBits = 2,
          context_data = [],
          context_data_val = 0,
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
            let value = context_w.charCodeAt(0) < 256 ? context_w.charCodeAt(0) : 1;

            for (let i = 0; i < context_numBits; i++) {
              context_data_val = context_data_val << 1 | ((value && i < 8) || i >= 8 && value) & 1;
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
              value >>= 1;
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
              context_data_val = context_data_val << 1 | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
              value >>= 1;
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
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          let value = context_w.charCodeAt(0) < 256 ? context_w.charCodeAt(0) : 1;

          for (let i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | ((value && i < 8) || i >= 8 && value) & 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value >>= 1;
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
            context_data_val = context_data_val << 1 | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value >>= 1;
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
        context_data_val = context_data_val << 1 | (value & 1);
        if (context_data_position == bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else context_data_position++;
        value >>= 1;
      }

      while (true) {
        context_data_val = context_data_val << 1;
        if (context_data_position == bitsPerChar - 1) {
          context_data.push(getCharFromInt(context_data_val));
          break;
        } else context_data_position++;
      }
      return context_data.join('');
    },

    decompress(compressed) {
      if (compressed == null) return "";
      if (compressed == "") return null;
      return LZString._decompress(compressed.length, 32768, index => compressed.charCodeAt(index));
    },

    _decompress(length, resetValue, getNextValue) {
      let dictionary = [0, 1, 2, null],
          bits, maxpower, power,
          c, data = { val: getNextValue(0), position: resetValue, index: 1 };

      const result = [];
      let w;

      bits = maxpower = Math.pow(2, 2);
      power = 1;
      let entry;

      while (power !== maxpower) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      switch (bits) {
        case 0:
        case 1:
          bits = maxpower = Math.pow(2, bits === 0 ? 8 : 16);
          power = 1;
          c = null;

          while (power !== maxpower) {
            const resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          c = f(bits);
          dictionary[3] = c;
          entry = c;
          break;
        case 2:
          return "";
        default:
          return null;
      }
      w = c;
      result.push(c);

      while (true) {
        if (data.index > length) {
          return "";
        }

        bits = maxpower = power = Math.pow(2, 3);
        power = 1;

        while (power !== maxpower) {
          const resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }

        switch (c = bits) {
          case 0:
          case 1:
            bits = maxpower = Math.pow(2, c === 0 ? 8 : 16);
            power = 1;

            while (power !== maxpower) {
              const resb = data.val & data.position;
              data.position >>= 1;
              if (data.position === 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }

            dictionary[dictionary.length] = f(bits);
            c = dictionary.length - 1;
            break;
          case 2:
            return result.join('');
          default:
            break;
        }

        if (dictionary[c]) {
          entry = dictionary[c];
        } else if (c === dictionary.length) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }

        result.push(entry);

        dictionary.push(w + entry.charAt(0));

        w = entry;
      }
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(() => LZString);
  } else if (typeof module !== 'undefined' && module != null) {
    module.exports = LZString;
  } else {
    global.LZString = LZString;
  }
})(this);
