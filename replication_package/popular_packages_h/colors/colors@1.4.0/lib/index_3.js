const colors = require('./colors');
module.exports = colors;

// Note: The following function call extends String.prototype with colors methods.
require('./extendStringPrototype')();

// If extending String.prototype is undesirable, use this approach instead:
// const colors = require('colors/safe');
// console.log(colors.red("foo"));
