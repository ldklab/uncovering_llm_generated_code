(function(global) {
  'use strict';

  // Function to retrieve flags of a given RegExp instance
  function getRegExpFlags(regExp) {
    if (!(regExp instanceof RegExp)) {
      throw new TypeError('Expected a RegExp instance');
    }
    // Construct the flags string by checking each property
    let flags = '';
    if (regExp.global) flags += 'g';
    if (regExp.ignoreCase) flags += 'i';
    if (regExp.multiline) flags += 'm';
    if (regExp.dotAll) flags += 's';
    if (regExp.unicode) flags += 'u';
    if (regExp.sticky) flags += 'y';
    return flags;
  }

  // Shim to add a 'flags' property to RegExp prototype if it doesn't exist
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

  // Exporting a function to extract flags and the shim function
  const exports = function flags(regExp) {
    return getRegExpFlags(regExp);
  };
  exports.shim = shimRegExpFlags;

  // Export for Node.js or assign to global object for browsers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    global.flags = exports;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global);
