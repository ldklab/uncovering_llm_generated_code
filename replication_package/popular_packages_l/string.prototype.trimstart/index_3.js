// string.prototype.trimstart.js

(function() {
  'use strict';

  // Check if String.prototype.trimStart already exists
  const hasTrimStart = typeof String.prototype.trimStart === 'function';

  const trimStartShim = function() {
    // Remove leading whitespace from the string
    return this.replace(/^\s+/, '');
  };

  const shim = function() {
    if (!hasTrimStart) {
      // Define the trimStart on String.prototype if it doesn't exist
      String.prototype.trimStart = trimStartShim;
    }
    return String.prototype.trimStart;
  };

  const getPolyfill = function() {
    return hasTrimStart ? String.prototype.trimStart : trimStartShim;
  };

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

// Exported functions:
// - getPolyfill(): gets the current `String.prototype.trimStart` or the shim
// - implementation(): returns the shimmed function
// - shim(): installs the shim if necessary

// Tests can be executed by installing dependencies and calling `npm test`
