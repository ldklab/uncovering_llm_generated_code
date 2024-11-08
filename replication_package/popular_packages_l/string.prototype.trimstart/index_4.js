(function() {
  'use strict';

  // Check if String.prototype.trimStart is available
  var hasTrimStart = typeof String.prototype.trimStart === 'function';

  // Define the polyfill function to remove leading whitespace
  var trimStartPolyfill = function() {
    return this.replace(/^\s+/, '');
  };

  // Function to define the polyfill if it's not present
  var shim = function() {
    if (!hasTrimStart) {
      String.prototype.trimStart = trimStartPolyfill;
    }
    return String.prototype.trimStart;
  };

  // Function to return the existing implementation or the polyfill
  var getPolyfill = function() {
    return hasTrimStart ? String.prototype.trimStart : trimStartPolyfill;
  };

  // Export the necessary functions
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: trimStartPolyfill,
    shim: shim
  };
})();

// Usage Example:
// const trimModule = require('./string.prototype.trimstart');
// console.log(trimModule.getPolyfill().call(' \t\na \t\n')); // 'a \t\n'
// trimModule.shim();
// console.log(' \t\na \t\n'.trimStart()); // 'a \t\n'

// Exported functions:
// - getPolyfill(): Returns either the native `trimStart` or the polyfill
// - implementation(): Provides the polyfill function directly
// - shim(): Adds the polyfill to `String.prototype` if `trimStart` does not exist
