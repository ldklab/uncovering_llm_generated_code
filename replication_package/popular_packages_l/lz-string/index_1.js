#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

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

function decompressFromBase64(input) {
  if (input == null) return '';
  return decompress(input.length, 32, (index) => getBaseValue(keyStrBase64, input.charAt(index)));
}

function compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return '';
  let context_dictionary = {},
      context_dictionaryToCreate = {},
      context_w = "",
      context_data = [],
      context_enlargeIn = 2,
      context_dictSize = 3,
      context_numBits = 2,
      context_data_val = 0,
      context_data_position = 0,
      ii, value;

  for (ii = 0; ii < uncompressed.length; ii++) {
    const context_c = uncompressed.charAt(ii);
    if (!context_dictionary.hasOwnProperty(context_c)) {
      context_dictionary[context_c] = context_dictSize++;
      context_dictionaryToCreate[context_c] = true;
    }
    const context_wc = context_w + context_c;
    if (context_dictionary.hasOwnProperty(context_wc)) {
      context_w = context_wc;
    } else {
      outputBits(context_w, context_numBits, bitsPerChar,
        context_dictionary, context_dictionaryToCreate, getCharFromInt);
      context_enlargeIn--;
      if (context_enlargeIn === 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      context_dictionary[context_wc] = context_dictSize++;
      context_w = String(context_c);
    }
  }

  if (context_w !== '') {
    outputBits(context_w, context_numBits, bitsPerChar,
      context_dictionary, context_dictionaryToCreate, getCharFromInt);
  }

  // End of the stream
  value = 2;
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

  // Flush the last char
  while (true) {
    context_data_val = (context_data_val << 1);
    if (context_data_position == bitsPerChar - 1) {
      context_data.push(getCharFromInt(context_data_val));
      break;
    }
    else context_data_position++;
  }
  return context_data.join('');
}

function outputBits(context_w, context_numBits, bitsPerChar, 
                    context_dictionary, context_dictionaryToCreate, getCharFromInt) {
  let value;
  if (context_dictionaryToCreate.hasOwnProperty(context_w)) {
    if (context_w.charCodeAt(0) < 256) {
      for (let i = 0; i < context_numBits; i++) {
        context_data_val = (context_data_val << 1);
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        } else {
          context_data_position++;
        }
      }
      value = context_w.charCodeAt(0);
      for (let i = 0; i < 8; i++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
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
        if (context_data_position === bitsPerChar - 1) {
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
        if (context_data_position === bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
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
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }
  }
}

function decompress(length, resetValue, getNextValue) {
  if (length === 0) return '';
  let dictionary = [],
      next,
      enlargeIn = 4,
      dictSize = 4,
      numBits = 3,
      entry = '',
      result = [],
      i,
      w,
      bits, resb, maxpower, power,
      c,
      data = {val: getNextValue(0), position: resetValue, index: 1};

  for (i = 0; i < 3; i++) {
    dictionary[i] = i;
  }

  bits = 0;
  maxpower = Math.pow(2, 2);
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

  switch (next = bits) {
    case 0:
      c = String.fromCharCode(getCharCode(8, resetValue, data, getNextValue));
      break;
    case 1:
      c = String.fromCharCode(getCharCode(16, resetValue, data, getNextValue));
      break;
    case 2:
      return '';
  }
  dictionary[3] = c;
  w = c;
  result.push(c);

  while (true) {
    if (data.index > length) {
      return '';
    }

    const c = getCharCode(numBits, resetValue, data, getNextValue);

    switch (c) {
      case 0:
        dictionary[dictSize++] = String.fromCharCode(
          getCharCode(8, resetValue, data, getNextValue));
        c = dictSize - 1;
        enlargeIn--;
        break;
      case 1:
        dictionary[dictSize++] = String.fromCharCode(
          getCharCode(16, resetValue, data, getNextValue));
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
    enlargeIn--;

    w = entry;

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
  }
}

function getCharCode(numBits, resetValue, data, getNextValue) {
  let bits = 0;
  let maxpower = Math.pow(2, numBits);
  let power = 1;
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
  return bits;
}

function getBaseValue(alphabet, character) {
  return alphabet.indexOf(character);
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

    const compressed = compressToBase64(data);
    fs.writeFile(outputFile, compressed, 'utf8', (err) => {
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
