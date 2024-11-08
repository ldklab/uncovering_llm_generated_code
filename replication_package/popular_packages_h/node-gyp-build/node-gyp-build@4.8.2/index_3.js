// Assign the appropriate require function for Webpack or Node.js environments
const runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

// Check if the runtime environment supports native add-on resolution
if (typeof runtimeRequire.addon === 'function') {
  // Export the native add-on function, if available
  module.exports = runtimeRequire.addon.bind(runtimeRequire);
} else {
  // Fallback to exporting the runtime version from 'node-gyp-build.js'
  module.exports = require('./node-gyp-build.js');
}
