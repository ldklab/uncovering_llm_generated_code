const colors = require('./colors');
module.exports = colors;

// Note: This will extend String.prototype with color styling functions by default.
//
// To use coloring without modifying String.prototype, consider using the safe variant:
//
//   const safeColors = require('@colors/colors/safe');
//   console.log(safeColors.red("foo"));

require('./extendStringPrototype')();
