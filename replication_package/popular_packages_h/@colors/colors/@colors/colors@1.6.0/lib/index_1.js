const colors = require('./colors');
module.exports = colors;

// Commented alternative usage for non-extension of String.prototype:
// const colors = require('@colors/colors/safe');
// console.log(colors.red("foo"));

require('./extendStringPrototype')();
