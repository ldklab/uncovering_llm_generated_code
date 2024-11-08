#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function getBaseValue(alphabet, character) {
  return alphabet.indexOf(character);
}

function compressToBase64(input) {
  if (input == null) return '';
  let res = compress(input, 6, (a) => keyStrBase64.charAt(a));
  switch (res.length % 4) {
    case 0: return res;
    case 1: return res + "===";
    case 2: return res + "==";
    case 3: return res + "=";
  }
}

function compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return '';
  let context_dictionary = {},
      context_dictionaryToCreate = {},
      context_wc,
      context_w = '',
      context_enlargeIn = 2,
      context_dictSize = 3,
      context_numBits = 2,
      context_data = [], 
      context_data_val = 0,
      context_data_position = 0;
  
  uncompressed.split('').forEach(context_c => {
    if (!context_dictionary.hasOwnProperty(context_c)) {
      context_dictionary[context_c] = context_dictSize++;
      context_dictionaryToCreate[context_c] = true;
    }
    context_wc = context_w + context_c;
    if (context_dictionary.hasOwnProperty(context_wc)) {
      context_w = context_wc;
    } else {
      context_w.split('').forEach((_, i) => {
        context_data_val = (context_data_val << 1);
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
      });
      if (context_w.charCodeAt(0) < 256) {
        let value = context_w.charCodeAt(0);
        for (let i = 0; i < 8; i++) {
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
      } else {
        let value = 1;
        for (let i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | value;
          if (context_data_position === bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = 0;
        }
        let valueChar = context_w.charCodeAt(0);
        for (let i = 0; i < 16; i++) {
          context_data_val = (context_data_val << 1) | (valueChar & 1);
          if (context_data_position === bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          valueChar >>= 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn === 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      delete context_dictionaryToCreate[context_w];
      context_dictionary[context_wc] = context_dictSize++;
      context_w = String(context_c);
    }
  });

  if (context_w !== '') {
    context_w.split('').forEach((_, i) => {
      context_data_val = (context_data_val << 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
    });
    if (context_w.charCodeAt(0) < 256) {
      let value = context_w.charCodeAt(0);
      for (let i = 0; i < 8; i++) {
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
    } else {
      let value = 1;
      for (let i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1) | value;
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        value = 0;
      }
      let valueChar = context_w.charCodeAt(0);
      for (let i = 0; i < 16; i++) {
        context_data_val = (context_data_val << 1) | (valueChar & 1);
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
        valueChar >>= 1;
      }
    }
    context_enlargeIn--;
    if (context_enlargeIn === 0) {
      context_enlargeIn = Math.pow(2, context_numBits);
      context_numBits++;
    }
  }

  let value = 2;
  for (let i = 0; i < context_numBits; i++) {
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

  while (true) {
    context_data_val = (context_data_val << 1);
    if (context_data_position === bitsPerChar - 1) {
      context_data.push(getCharFromInt(context_data_val));
      break;
    } else {
      context_data_position++;
    }
  }
  return context_data.join('');
}

function decompressFromBase64(input) {
  if (input == null) return '';
  return decompress(input.length, 32, (index) => getBaseValue(keyStrBase64, input.charAt(index)));
}

function decompress(length, resetValue, getNextValue) {
  if (length == 0) return '';
  const dictionary = [];
  let bits, maxpower, power, resb, enlargeIn = 4, dictSize = 4, numBits = 3, entry = '',
      result = [], w, c, next;
  let data = { val: getNextValue(0), position: resetValue, index: 1 };

  for (let i = 0; i < 3; i++) {
    dictionary[i] = i;
  }

  bits = maxpower = Math.pow(2, 2);
  power = 1;
  while (power !== maxpower) {
    resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = resetValue;
      data.val = getNextValue(data.index++);
    }
    bits = (resb > 0 ? 1 : 0) * power | bits;
    power <<= 1;
  }

  switch (next = bits) {
    case 0:
    case 1:
      bits = maxpower = Math.pow(2, next ? 16 : 8);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits = (resb > 0 ? 1 : 0) * power | bits;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return '';
  }

  dictionary[3] = w = c;
  result.push(c);

  while (true) {
    if (data.index > length) {
      return '';
    }

    bits = maxpower = Math.pow(2, numBits);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits = (resb > 0 ? 1 : 0) * power | bits;
      power <<= 1;
    }

    switch (c = bits) {
      case 0:
      case 1:
        bits = maxpower = Math.pow(2, c ? 16 : 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits = (resb > 0 ? 1 : 0) * power | bits;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        c = dictSize - 1;
        enlargeIn--;
        break;
      case 2:
        return result.join('');
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    if (!dictionary[c]) {
      if (c === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return null;
      }
    } else {
      entry = dictionary[c];
    }
    result.push(entry);

    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;

    w = entry;

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: lz-string <input file> <output file>');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file '${inputFile}':`, err);
      process.exit(1);
    }

    const compressedData = compressToBase64(data);
    fs.writeFile(outputFile, compressedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to file '${outputFile}':`, err);
        process.exit(1);
      }
      console.log(`Compression complete, output written to '${outputFile}'`);
    });
  });
}

if (require.main === module) {
  main();
}
