const determineRequire = () => {
  if (typeof __webpack_require__ === 'function') {
    return __non_webpack_require__;
  }
  return require;
};

const runtimeRequire = determineRequire();

if (typeof runtimeRequire.addon === 'function') {
  module.exports = runtimeRequire.addon.bind(runtimeRequire);
} else {
  module.exports = require('./node-gyp-build.js');
}
