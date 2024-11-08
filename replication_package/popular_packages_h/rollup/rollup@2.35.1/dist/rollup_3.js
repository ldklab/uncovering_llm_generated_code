'use strict';

// Export the necessary Rollup functions from the internal rollup module
exports.VERSION = require('./shared/rollup.js').version;
exports.rollup = require('./shared/rollup.js').rollup;
exports.watch = require('./shared/rollup.js').watch;
