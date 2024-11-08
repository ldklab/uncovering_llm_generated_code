// string_decoder/index.js
'use strict';

const { StringDecoder } = require('string_decoder');

// Function to create a new StringDecoder instance with a specified encoding
function createStringDecoder(encoding = 'utf8') {
  return new StringDecoder(encoding);
}

// Demonstrative usage of the StringDecoder
const buffer = Buffer.from([0xe2, 0x82, 0xac]); // Bytes representing the UTF-8 euro sign
const utf8Decoder = createStringDecoder('utf8');

// Decoding incomplete UTF-8 character using the 'write' method
const incompleteString = utf8Decoder.write(buffer.slice(0, 2));
// Completing the string using the 'end' method with the remaining byte
const completeString = utf8Decoder.end(buffer.slice(2));

console.log('Incomplete:', incompleteString); // Should output: 'Incomplete: '
console.log('Complete:', completeString); // Should output: 'Complete: €'

// Export the createStringDecoder function for use in other modules
module.exports = {
  createStringDecoder
};
