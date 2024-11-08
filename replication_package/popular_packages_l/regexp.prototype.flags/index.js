(function(global) {
  'use strict';

  function getRegExpFlags(re) {
    if (!(re instanceof RegExp)) {
      throw new TypeError('Expected a RegExp instance');
    }
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    if (re.dotAll) flags += 's';
    if (re.unicode) flags += 'u';
    if (re.sticky) flags += 'y';
    return flags;
  }

  function shimRegExpFlags() {
    if (!Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')) {
      Object.defineProperty(RegExp.prototype, 'flags', {
        configurable: true,
        get: function() {
          return getRegExpFlags(this);
        }
      });
    }
  }

  // Expose the main function and the shim method
  var exports = function flags(re) {
    return getRegExpFlags(re);
  };
  exports.shim = shimRegExpFlags;

  // Module exports for Node.js, global assignment for browsers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    global.flags = exports;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global);
