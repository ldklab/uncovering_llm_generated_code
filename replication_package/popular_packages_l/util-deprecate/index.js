(function (exports, global) {
  'use strict';

  // Node.js environment
  if (typeof process !== 'undefined' && process.version) {
    const util = require('util');
    exports.deprecate = util.deprecate;
  } else { // Browser environment
    let warned = {};

    exports.deprecate = function(fn, msg) {
      function deprecated() {
        if (!warned[msg]) {
          if (typeof console !== 'undefined' && console.warn) {
            console.warn(msg);
          }
          warned[msg] = true;
        }
        return fn.apply(this, arguments);
      }
      return deprecated;
    };
  }
})(typeof exports === 'undefined' ? this['utilDeprecate'] = {} : exports, this);
