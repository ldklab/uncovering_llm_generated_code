// string.prototype.trimstart.js

(function() {
  'use strict';

  // Determine if String.prototype.trimStart is already available
  var hasTrimStart = typeof String.prototype.trimStart === 'function';

  // Shim function to trim leading whitespace from strings
  var trimStartShim = function() {
    return this.replace(/^\s+/, '');
  };

  // Shim function definition: adds trimStart to String.prototype if missing
  var shim = function() {
    if (!hasTrimStart) {
      String.prototype.trimStart = trimStartShim;
    }
    return String.prototype.trimStart;
  };

  // Function to get the appropriate version of trimStart
  var getPolyfill = function() {
    return hasTrimStart ? String.prototype.trimStart : trimStartShim;
  };

  // Exporting the functions as a module
  module.exports = {
    getPolyfill: getPolyfill,
    implementation: trimStartShim,
    shim: shim
  };
})();

// Example usage
// const trimStart = require('./string.prototype.trimstart');
// console.log(trimStart.getPolyfill().call(' \t\na \t\n')); // 'a \t\n'
// trimStart.shim();
// console.log(' \t\na \t\n'.trimStart()); // 'a \t\n'

// This module exports three main functions:
// - getPolyfill: retrieves the current `String.prototype.trimStart` or the shim
// - implementation: provides the shimmed function
// - shim: installs the shim to the prototype if it's not already there
