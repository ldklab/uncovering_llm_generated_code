(function(root) {
  'use strict';

  // Function to retrieve the flags of a RegExp instance
  function extractRegExpFlags(regex) {
    if (!(regex instanceof RegExp)) {
      throw new TypeError('The argument must be an instance of RegExp');
    }
    let flags = '';
    if (regex.global) flags += 'g';
    if (regex.ignoreCase) flags += 'i';
    if (regex.multiline) flags += 'm';
    if (regex.dotAll) flags += 's';
    if (regex.unicode) flags += 'u';
    if (regex.sticky) flags += 'y';
    return flags;
  }

  // Function to add a 'flags' property to RegExp.prototype if it doesn't exist
  function addFlagsProperty() {
    if (!Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags')) {
      Object.defineProperty(RegExp.prototype, 'flags', {
        configurable: true,
        get: function() {
          return extractRegExpFlags(this);
        }
      });
    }
  }

  // Main export: a function that returns the flags of a regex
  const flagsModule = function getFlags(regex) {
    return extractRegExpFlags(regex);
  };

  // Add a method to the export for shimming the RegExp.prototype.flags
  flagsModule.shim = addFlagsProperty;

  // Export the module for Node.js or assign to a global variable for browsers
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = flagsModule;
  } else {
    root.flags = flagsModule;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global);
