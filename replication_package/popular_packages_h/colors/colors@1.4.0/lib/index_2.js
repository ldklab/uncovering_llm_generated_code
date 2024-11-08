const colors = require('./colors');
module.exports = colors;

// By default, colors will add style properties directly to String.prototype.
// To avoid modifying String.prototype, you can alternatively import:
// const colors = require('colors/safe');
// colors.red("foo");

require('./extendStringPrototype')();
