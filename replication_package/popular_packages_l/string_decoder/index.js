// string_decoder/index.js
'use strict';

const { StringDecoder } = require('string_decoder');

// StringDecoder implementation
function createStringDecoder(encoding = 'utf8') {
  return new StringDecoder(encoding);
}

// Example usage
const utf8Decoder = createStringDecoder('utf8');
const buffer = Buffer.from([0xe2, 0x82, 0xac]); // Partial euro sign character
const incompleteString = utf8Decoder.write(buffer.slice(0, 2));
const completeString = utf8Decoder.end(buffer.slice(2));

console.log('Incomplete:', incompleteString); // Incomplete: ''
console.log('Complete:', completeString); // Complete: '€'

// Exported module functions
module.exports = {
  createStringDecoder
};
