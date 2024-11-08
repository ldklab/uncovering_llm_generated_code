#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function compressToBase64(input) {
  if (input === null) return '';
  let compressed = compress(input, 6, (a) => keyStrBase64.charAt(a));
  return addPadding(compressed);
}

function addPadding(base64String) {
  switch (base64String.length % 4) {
    case 0: return base64String;
    case 1: return base64String + "===";
    case 2: return base64String + "==";
    case 3: return base64String + "=";
  }
}

function compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (!uncompressed) return '';
  let dictionary = {}, dictionaryToCreate = {}, w = '', result = [], enlargeIn = 2;
  let dictSize = 3, numBits = 2, data_val = 0, data_position = 0;

  for (let i = 0; i < uncompressed.length; i++) {
    const c = uncompressed.charAt(i);
    if (!dictionary[c]) {
      dictionary[c] = dictSize++;
      dictionaryToCreate[c] = true;
    }

    const wc = w + c;
    if (dictionary[wc]) {
      w = wc;
    } else {
      writeDictionaryEntry(dictionary, dictionaryToCreate, w, bitsPerChar, numBits, getCharFromInt, result, data_val, data_position);
      data_val = data_position = 0;
      enlarge(dictionary, dictSize, enlargeIn);
      dictionary[wc] = dictSize++;
      w = c;
    }
  }

  if (w) {
    writeDictionaryEntry(dictionary, dictionaryToCreate, w, bitsPerChar, numBits, getCharFromInt, result, data_val, data_position);
    enlarge(dictionary, dictSize, enlargeIn);
  }

  // Mark end of stream
  for (let i = 0; i < numBits; i++) {
    data_val = (data_val << 1) | (2 & 1);
    if (data_position === bitsPerChar - 1) {
      result.push(getCharFromInt(data_val));
      break;
    } else data_position++;
  }

  while (data_position) {
    data_val = (data_val << 1);
    if (data_position === bitsPerChar - 1) {
      result.push(getCharFromInt(data_val));
      break;
    } 
    else data_position++;
  }
  return result.join('');
}

function writeDictionaryEntry(dict, dictToCreate, w, bitsPerChar, numBits, getCharFromInt, result, data_val, data_position) {
  let value;
  if (dictToCreate[w]) {
    if (w.charCodeAt(0) < 256) {
      for (let i = 0; i < numBits; i++) {
        data_val = (data_val << 1);
        if (data_position === bitsPerChar - 1) {
          data_position = 0;
          result.push(getCharFromInt(data_val));
          data_val = 0;
        } else {
          data_position++;
        }
      }
      value = w.charCodeAt(0);
      for (let i = 0; i < 8; i++) {
        data_val = (data_val << 1) | (value & 1);
        if (data_position === bitsPerChar - 1) {
          data_position = 0;
          result.push(getCharFromInt(data_val));
          data_val = 0;
        } else {
          data_position++;
        }
        value >>= 1;
      }
    } else {
      value = 1;
      for (let i = 0; i < numBits; i++) {
        data_val = (data_val << 1) | value;
        if (data_position === bitsPerChar - 1) {
          data_position = 0;
          result.push(getCharFromInt(data_val));
          data_val = 0;
        } else {
          data_position++;
        }
        value = 0;
      }
      value = w.charCodeAt(0);
      for (let i = 0; i < 16; i++) {
        data_val = (data_val << 1) | (value & 1);
        if (data_position === bitsPerChar - 1) {
          data_position = 0;
          result.push(getCharFromInt(data_val));
          data_val = 0;
        } else {
          data_position++;
        }
        value >>= 1;
      }
    }
    delete dictToCreate[w];
  } else {
    value = dict[w];
    for (let i = 0; i < numBits; i++) {
      data_val = (data_val << 1) | (value & 1);
      if (data_position === bitsPerChar - 1) {
        data_position = 0;
        result.push(getCharFromInt(data_val));
        data_val = 0;
      } else {
        data_position++;
      }
      value >>= 1;
    }
  }
}

function enlarge(dictionary, dictSize, enlargeIn) {
  enlargeIn--;
  if (enlargeIn === 0) {
    const newNumBits = Math.ceil(Math.log2(dictSize));
    enlargeIn = Math.pow(2, newNumBits);
  }
}

function decompressFromBase64(input) {
  if (input === null) return '';
  return decompress(input.length, 32, (index) => getBaseValue(keyStrBase64, input.charAt(index)));
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

  const [inputFile, outputFile] = args;

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
