(function (exports, global) {
  'use strict';

  function browserDeprecate(fn, msg) {
    let warned = false;
    return function() {
      if (!warned) {
        if (console && console.warn) {
          console.warn(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    };
  }

  // Check Node.js environment
  if (typeof process !== 'undefined' && process.version) {
    const { deprecate } = require('util');
    exports.deprecate = deprecate;
  } else { // Browser environment
    exports.deprecate = browserDeprecate;
  }
})(typeof exports === 'undefined' ? (this.utilDeprecate = {}) : exports, this);
