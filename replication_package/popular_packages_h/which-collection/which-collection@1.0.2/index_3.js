'use strict';

// Import modules that check the type of a JavaScript object
var isMap = require('is-map');
var isSet = require('is-set');
var isWeakMap = require('is-weakmap');
var isWeakSet = require('is-weakset');

/**
 * Function to determine the type of a collection
 * @param {unknown} value - The value to be checked
 * @returns {string|boolean} - Returns the collection type name or false
 */
module.exports = function whichCollection(value) {
	if (value && typeof value === 'object') {
		if (isMap(value)) {
			return 'Map';
		}
		if (isSet(value)) {
			return 'Set';
		}
		if (isWeakMap(value)) {
			return 'WeakMap';
		}
		if (isWeakSet(value)) {
			return 'WeakSet';
		}
	}
	return false; // Return false if not one of the collection types
};
