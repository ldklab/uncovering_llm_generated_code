// Import the colors module from a local file
const colors = require('./colors');

// Export the colors module for external use
module.exports = colors;

// The following explains the behavior of the colors module:
// By default, it extends the String.prototype to allow color styling directly on strings.
// If you prefer not to extend String.prototype, use the 'safe' version:
// const colors = require('@colors/colors/safe');
// colors.red("foo");

// Extend String.prototype with additional color styling methods
require('./extendStringPrototype')();
