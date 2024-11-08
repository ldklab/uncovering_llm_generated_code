/*
  @license
	Rollup.js v2.35.1
	Mon, 14 Dec 2020 14:00:58 GMT - commit 1378cae13b33838de9c8ba9ef9152354f6eed27b

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

const rollup = require('./shared/rollup.js');

// Node.js core modules required by rollup
require('fs');
require('path');
require('crypto');
require('events');

// Exporting Rollup.js functionality
module.exports = {
  VERSION: rollup.version,
  rollup: rollup.rollup,
  watch: rollup.watch
};
//# sourceMappingURL=rollup.js.map
