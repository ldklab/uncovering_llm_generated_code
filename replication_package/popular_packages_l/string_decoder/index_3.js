// string_decoder/index.js
'use strict';

const { StringDecoder } = require('string_decoder');

// Function to create a StringDecoder with a specified encoding
function createStringDecoder(encoding = 'utf8') {
  return new StringDecoder(encoding);
}

// Example usage of the StringDecoder
const utf8Decoder = createStringDecoder('utf8');
const buffer = Buffer.from([0xe2, 0x82, 0xac]); // Byte sequence for Euro sign
const incompleteString = utf8Decoder.write(buffer.slice(0, 2)); // Decode first two bytes
const completeString = utf8Decoder.end(buffer.slice(2)); // Decode remaining byte

console.log('Incomplete:', incompleteString); // Expected output: Incomplete: ''
console.log('Complete:', completeString); // Expected output: Complete: '€'

// Export the function for external use
module.exports = {
  createStringDecoder
};
