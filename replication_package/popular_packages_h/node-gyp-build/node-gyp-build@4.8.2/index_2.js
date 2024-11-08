// Determine which require function to use based on the environment
const runtimeRequire = (typeof __webpack_require__ === 'function') 
  ? __non_webpack_require__ 
  : require; // eslint-disable-line

// Check if the environment provides a native 'addon' method for resolving modules
if (typeof runtimeRequire.addon === 'function') {
  // If native 'addon' resolver is available, export it bound to runtimeRequire
  module.exports = runtimeRequire.addon.bind(runtimeRequire);
} else {
  // If not available, fall back to exporting the node-gyp compiled module
  module.exports = require('./node-gyp-build.js');
}
