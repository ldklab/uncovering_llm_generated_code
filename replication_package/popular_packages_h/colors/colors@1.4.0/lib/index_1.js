// Import the local 'colors' module
const colors = require('./colors');

// Export the 'colors' module to be accessible when this module is required
module.exports = colors;

// Remark: By default, 'colors' will extend the String.prototype with styling capabilities.
// If you wish to avoid altering the native String.prototype, you can require 'colors' in safe mode:
// const colors = require('colors/safe');
// console.log(colors.red("foo")); // Usage without String prototype modification

// Import and execute the code that extends the String prototype.
// This makes color styling properties available on all String objects.
require('./extendStringPrototype')();
