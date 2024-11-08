#!/usr/bin/env node

const fs = require('fs');

const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function compressToBase64(input) {
  return input ? compress(input, 6, (a) => keyStrBase64.charAt(a)) + '==='["===".length - (compress(input, 6, (a) => keyStrBase64.charAt(a)).length % 4)] : '';
}

function decompressFromBase64(input) {
  return input ? decompress(input.length, 32, (index) => getBaseValue(keyStrBase64, input.charAt(index))) : '';
}

function compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return '';
  let context_dictionary = {}, context_wc, context_w = '';
  let context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2;
  let context_data = [], context_data_val = 0, context_data_position = 0;
  
  for (let ii = 0; ii < uncompressed.length; ii++) {
    let context_c = uncompressed.charAt(ii);
    if (!context_dictionary.hasOwnProperty(context_c)) {
      context_dictionary[context_c] = context_dictSize++;
      context_data = context_w ? encode(context_w, context_dictionary, context_data, context_numBits, bitsPerChar, context_data_val, context_data_position, getCharFromInt) : context_data;
      ({ context_data_val, context_data_position, context_w } = delete context_data.context_data_val ? { context_data_val, context_data_position } : { context_data_val: 0, context_data_position: context_data_position + 1, context_w: context_w + context_c });
    } else {
      context_wc = context_w + context_c;
      context_data = context_dictionary.hasOwnProperty(context_wc) ? { context_data, context_w } : encode(context_wc, context_dictionary, context_data, context_numBits, bitsPerChar, context_data_val, context_data_position, getCharFromInt);
    }
  }
  return context_dictionaryToCreate[context_w] ? finalize(context_w, bitsPerChar, getCharFromInt, context_data, context_numBits, context_data_val, context_data_position) : finalize(context_dictionary[context_w], bitsPerChar, getCharFromInt, context_data, context_numBits, context_data_val, context_data_position);
}

function encode(context_w, context_dictionary, context_data, context_numBits, bitsPerChar, context_data_val, context_data_position, getCharFromInt) {
  let value = context_w.charCodeAt(0) < 256 ? 0 : 1;
  let addToDict = (n) => { context_data_val = (context_data_val << 1) | n; if (context_data_position == bitsPerChar - 1) return [...context_data, getCharFromInt(context_data_val)], [0, 0]; return [context_data, context_data_val, context_data_position + 1] };
  [context_data, context_data_val, context_data_position] = addToDict(value);
  value = context_w.charCodeAt(0);
  for (let i = 0; i < (context_w.charCodeAt(0) < 256 ? 8 : 16); i++) [context_data, context_data_val, context_data_position] = addToDict(value & 1), value >>= 1;
  return context_data;
}

function finalize(context_data, bitsPerChar, getCharFromInt, context_data_val, context_data_position) {
  while (true) { context_data_val <<= 1; if (context_data_position == bitsPerChar - 1) return [getCharFromInt(context_data_val), ...context_data].join(''); context_data_position++; }
}

function decompress(length, resetValue, getNextValue) {
  if (!length) return '';
  let dictionary = Array(4).fill(0).map((_, i) => i), next = 0;
  let enlargeIn = 4, dictSize = 4, numBits = 3, entry = '';
  let data = { val: getNextValue(0), position: resetValue, index: 1 }, result = [];
  
  let getBits = (power, bits = 0, maxpower = Math.pow(2, next)) => {
    while (power !== maxpower) {
      let resb = data.val & data.position; data.position >>= 1; if (!data.position) data.position = resetValue, data.val = getNextValue(data.index++);
      bits |= (resb > 0 ? 1 : 0) * power; power <<= 1;
    }
    return bits;
  };
  
  do { next = bits; next = next ? getBits(next) : (dictionary[3] = String.fromCharCode(getBits(1, 0, Math.pow(2, 8))), result.push(dictionary[3]), 3); } while (data.index <= length);
  
  while (enlargeIn && (bits = getBits(numBits))) {
    if (dictionary[c]) entry = dictionary[c]; else { entry = bits === dictSize ? w + w.charAt(0) : null; if (!entry) return ''; }
    result.push(entry);
    dictionary[dictSize++] = w + entry.charAt(0); w = entry; if (--enlargeIn == 0) enlargeIn = Math.pow(2, numBits++);
  }
  return result.join('');
}

function getBaseValue(alphabet, character) {
  return alphabet.indexOf(character);
}

function main() {
  const [inputFile, outputFile] = process.argv.slice(2);
  if (!inputFile || !outputFile) return console.error('Usage: lz-string <input file> <output file>'), void process.exit(1);

  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) return console.error(`Error reading file '${inputFile}':`, err), void process.exit(1);

    fs.writeFile(outputFile, compressToBase64(data), 'utf8', (err) => {
      if (err) return console.error(`Error writing to file '${outputFile}':`, err), void process.exit(1);

      console.log(`Compression complete, output written to '${outputFile}'`);
    });
  });
}

if (require.main === module) {
  main();
}
