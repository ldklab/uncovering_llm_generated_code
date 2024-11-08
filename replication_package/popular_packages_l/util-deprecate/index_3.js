(function (exports, global) {
  'use strict';

  // Check if the code is running in a Node.js environment
  if (typeof process !== 'undefined' && process.version) {
    const util = require('util');
    exports.deprecate = util.deprecate;
  } else { 
    // If not in Node.js, assume a browser environment
    let warned = {};

    exports.deprecate = function(fn, msg) {
      function deprecated() {
        // Check if the warning message has already been shown
        if (!warned[msg]) {
          // Show a warning in the console if the console is available
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(msg);
          }
          // Mark the message as shown
          warned[msg] = true;
        }
        // Invoke the original function
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
  }
})(typeof exports === 'undefined' ? this['utilDeprecate'] = {} : exports, this);
