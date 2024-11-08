const isWebpack = typeof __webpack_require__ === 'function';
const requireFunction = isWebpack ? __non_webpack_require__ : require; // eslint-disable-line

if (typeof requireFunction.addon === 'function') {
  module.exports = requireFunction.addon.bind(requireFunction);
} else {
  module.exports = require('./node-gyp-build.js');
}
