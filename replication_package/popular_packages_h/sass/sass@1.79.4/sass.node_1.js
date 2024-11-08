// Require the Dart-compiled JavaScript file assuming an export to globalThis
require('./sass.dart.js');

// Retrieve and remove the last item from the global _cliPkgExports array
const library = globalThis._cliPkgExports.pop();

// Clean up by deleting the array if it's empty
if (globalThis._cliPkgExports.length === 0) {
  delete globalThis._cliPkgExports;
}

// Load the library with necessary dependencies
library.load({
  util: require("util"),
  stream: require("stream"),
  nodeModule: require("module"),
  fs: require("fs"),
  immutable: require("immutable"),
});

// Export the loaded library for external use
module.exports = library;
