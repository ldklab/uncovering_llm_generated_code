(function (exports, global) {
  'use strict';

  // Check if the environment is Node.js
  if (typeof process !== 'undefined' && process.version) {
    // In Node.js, utilize the built-in 'util.deprecate'
    const util = require('util');
    exports.deprecate = util.deprecate;
  } else {
    // Define a deprecation function for browser
    let warned = {};

    // Function to handle deprecation warnings
    exports.deprecate = function(fn, msg) {
      function deprecated() {
        // Warn the first time the deprecated function is called
        if (!warned[msg]) {
          // If console is present, log a warning message
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(msg);
          }
          // Mark this message as warned
          warned[msg] = true;
        }
        // Call the original function with original arguments
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
  }
})(typeof exports === 'undefined' ? this['utilDeprecate'] = {} : exports, this);
