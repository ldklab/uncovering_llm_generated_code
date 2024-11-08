// Import the local 'colors' module
const colors = require('./colors');

// Export the imported 'colors' module
module.exports = colors;

// Note: By default, this approach will enhance String.prototype with color styling
// properties, allowing direct usage of color styles on strings like 'string'.red.
//
// If modifying the native String.prototype is undesired, an alternative approach
// is to use the 'safe' variant of the colors module that doesn't modify prototypes.
//
// Example usage with the safe colors module:
// const colorsSafe = require('@colors/colors/safe');
// console.log(colorsSafe.red("foo")) would print 'foo' in red without modifying String.prototype.

// Enhance String.prototype with color styling capabilities using the 'extendStringPrototype' module
require('./extendStringPrototype')();
