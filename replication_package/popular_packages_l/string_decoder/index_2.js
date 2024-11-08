// string_decoder/index.js
'use strict';

const { StringDecoder } = require('string_decoder');

// Function to create a StringDecoder instance with specified encoding
function createStringDecoder(encoding = 'utf8') {
  return new StringDecoder(encoding);
}

// Demonstration of StringDecoder instance performing partial buffer handling
const utf8Decoder = createStringDecoder('utf8');
const buffer = Buffer.from([0xe2, 0x82, 0xac]); // Buffer containing a partial UTF-8 multibyte character (euro sign)
const incompleteString = utf8Decoder.write(buffer.slice(0, 2)); // Attempt to decode an incomplete character
const completeString = utf8Decoder.end(buffer.slice(2)); // Decode the remaining part to complete the character

// Display results of the partial and complete decoding process
console.log('Incomplete:', incompleteString); // Should display an empty string since the character is incomplete
console.log('Complete:', completeString); // Should display the complete euro sign character '€'

// Export the createStringDecoder function for use in other parts of the application
module.exports = {
  createStringDecoder
};
