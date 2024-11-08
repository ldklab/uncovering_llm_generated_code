(function(global) {
  'use strict';

  // Helper function to retrieve flags from a RegExp instance
  function getRegExpFlags(re) {
    if (!(re instanceof RegExp)) {
      throw new TypeError('Expected a RegExp instance');
    }

    // Accumulate flags based on the RegExp properties
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    if (re.dotAll) flags += 's';
    if (re.unicode) flags += 'u';
    if (re.sticky) flags += 'y';

    return flags;
  }

  // Shim function to add 'flags' property to RegExp.prototype if it doesn't exist
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

  // Main exported function
  var exports = function flags(re) {
    return getRegExpFlags(re);
  };

  // Attach the shim function for external use
  exports.shim = shimRegExpFlags;

  // Export for Node.js environment or assign to the global object for browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    global.flags = exports;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global);
