// Import the 'colors' module that provides functionality to add color styles.
var colors = require('./colors');

// Export the 'colors' module, making it available for other modules to use.
module.exports = colors;

// Additional note for users regarding the extension of String.prototype:
// By default, importing './colors' will extend the native String.prototype
// with methods for styling text, such as applying colors.
// If avoiding modifications to String.prototype is preferred,
// users can opt for an alternative approach:
//   var colors = require('colors/safe');
//   console.log(colors.red("foo"));

// Explicitly extend String.prototype with color styling methods.
require('./extendStringPrototype')();
