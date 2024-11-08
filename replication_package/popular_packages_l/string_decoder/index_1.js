// StringDecoder module import
const { StringDecoder } = require('string_decoder');

// Function to create a StringDecoder with a specified encoding
function createStringDecoder(encoding = 'utf8') {
  return new StringDecoder(encoding);
}

// Demonstration of the StringDecoder usage
const utf8Decoder = createStringDecoder('utf8');
const euroSymbolBytes = Buffer.from([0xe2, 0x82, 0xac]); // Bytes representing euro sign
const firstPart = utf8Decoder.write(euroSymbolBytes.slice(0, 2)); // Decode first 2 bytes
const finalPart = utf8Decoder.end(euroSymbolBytes.slice(2)); // Decode remaining byte

console.log('Incomplete:', firstPart); // Should log: Incomplete: ''
console.log('Complete:', finalPart); // Should log: Complete: '€'

// Export function for external use
module.exports = {
  createStringDecoder
};
