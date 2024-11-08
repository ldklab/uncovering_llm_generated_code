// string.prototype.trimstart.js

(function() {
  'use strict';

  // Check if String.prototype.trimStart already exists
  var hasTrimStart = typeof String.prototype.trimStart === 'function';

  var trimStartShim = function() {
    // Remove leading whitespace from the string
    return this.replace(/^\s+/, '');
  };

  var shim = function() {
    if (!hasTrimStart) {
      // Define the trimStart on String.prototype if it doesn't exist
      String.prototype.trimStart = trimStartShim;
    }
    return String.prototype.trimStart;
  };

  var getPolyfill = function() {
    return hasTrimStart ? String.prototype.trimStart : trimStartShim;
  };

  module.exports = {
    getPolyfill: getPolyfill,
    implementation: trimStartShim,
    shim: shim
  };
})();

// Rewritten code

(function() {
  'use strict';

  // Determine if String.prototype.trimStart is already defined
  const nativeTrimStart = typeof String.prototype.trimStart === 'function';

  // A shim function to remove leading whitespace characters
  const shimTrimStart = function() {
    return this.replace(/^\s+/, '');
  };

  // Function to apply the shim if native trimStart doesn't exist
  const applyShim = function() {
    if (!nativeTrimStart) {
      String.prototype.trimStart = shimTrimStart;
    }
    return String.prototype.trimStart;
  };

  // Function to return either the native trimStart or the shim
  const polyfill = function() {
    return nativeTrimStart ? String.prototype.trimStart : shimTrimStart;
  };

  module.exports = {
    getPolyfill: polyfill,
    implementation: shimTrimStart,
    shim: applyShim
  };
})();
