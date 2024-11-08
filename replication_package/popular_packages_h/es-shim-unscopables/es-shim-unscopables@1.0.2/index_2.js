'use strict';

var hasOwn = require('hasown');

// Check if the environment supports the Symbol.unscopables feature
var hasUnscopables = typeof Symbol === 'function' && typeof Symbol.unscopables === 'symbol';

// Reference to the unscopables property of Array prototype if it exists
var map = hasUnscopables && Array.prototype[Symbol.unscopables];

var $TypeError = TypeError;

/**
 * Adds a method to the unscopables list of Array.prototype if supported
 * 
 * @param {string} method - The name of the method to be made unscopable
 * @throws {TypeError} If the method is not a valid non-empty string or does not exist on Array.prototype
 */
module.exports = function shimUnscopables(method) {
	// Ensure the method param is a non-empty string
	if (typeof method !== 'string' || !method) {
		throw new $TypeError('method must be a non-empty string');
	}
	// Ensure the method exists on Array.prototype
	if (!hasOwn(Array.prototype, method)) {
		throw new $TypeError('method must be on Array.prototype');
	}
	// If unscopables are supported, set the method as unscopable
	if (hasUnscopables) {
		map[method] = true;
	}
};
