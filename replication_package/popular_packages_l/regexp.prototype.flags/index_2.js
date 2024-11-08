(function(global) {
  'use strict';

  // Function to extract flags from a RegExp object
  function getRegExpFlags(re) {
    if (!(re instanceof RegExp)) {
      throw new TypeError('Expected a RegExp instance');
    }

    // Initialize an empty string for flags
    var flags = '';

    // Check for each flag and append it if present
    if (re.global) flags += 'g';       // Global search
    if (re.ignoreCase) flags += 'i';   // Case-insensitive search
    if (re.multiline) flags += 'm';    // Multi-line search
    if (re.dotAll) flags += 's';       // Dot matches newline characters
    if (re.unicode) flags += 'u';      // Unicode matching
    if (re.sticky) flags += 'y';       // Sticky matching

    return flags;
  }

  // Function to add a 'flags' property to RegExp prototype if it doesn't already exist
  function shimRegExpFlags() {
    if (!Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')) {
      Object.defineProperty(RegExp.prototype, 'flags', {
        configurable: true, // Property can be deleted or changed
        get: function() {
          return getRegExpFlags(this);
        }
      });
    }
  }

  // Main module export function that returns flags for a given RegExp
  var exports = function flags(re) {
    return getRegExpFlags(re);
  };

  // Append shim method to exports object
  exports.shim = shimRegExpFlags;

  // Determine module system: Node.js or browser, and export accordingly
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  } else {
    global.flags = exports;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global);
