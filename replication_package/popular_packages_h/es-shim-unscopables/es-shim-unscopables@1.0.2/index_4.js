'use strict';

const hasOwn = require('hasown');

const hasUnscopables = typeof Symbol === 'function' && typeof Symbol.unscopables === 'symbol';

const unscopablesMap = hasUnscopables ? Array.prototype[Symbol.unscopables] : null;

module.exports = function shimUnscopables(method) {
	if (typeof method !== 'string' || method.length === 0) {
		throw new TypeError('method must be a non-empty string');
	}
	if (!hasOwn(Array.prototype, method)) {
		throw new TypeError('method must be on Array.prototype');
	}
	if (hasUnscopables) {
		unscopablesMap[method] = true;
	}
};
