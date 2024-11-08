(function (exports, global) {
  'use strict';

  // Functionality Explanation:
  // This code defines a mechanism for handling deprecated functions, offering different implementations for Node.js and browser environments.

  if (typeof process !== 'undefined' && process.version) {
    // If running in a Node.js environment, utilize Node's native util.deprecate function.
    const util = require('util');
    exports.deprecate = util.deprecate;
  } else {
    // If running in a browser environment, define a custom deprecation function.
    let warned = {};

    exports.deprecate = function(fn, msg) {
      function deprecated() {
        // Logs a deprecation warning only once for each unique message.
        if (!warned[msg]) {
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(msg);  // Outputs warning message to the console.
          }
          warned[msg] = true;  // Marks the message as warned.
        }
        // Executes the original function with provided arguments.
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
  }
})(typeof exports === 'undefined' ? this['utilDeprecate'] = {} : exports, this);
