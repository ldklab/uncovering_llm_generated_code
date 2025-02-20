'use strict';

const possibleNames = require('possible-typed-array-names');

const globalScope = typeof globalThis === 'undefined' ? global : globalThis;

/**
 * Checks for available typed array constructors on the current global object.
 * @returns {string[]} An array of strings representing the names of available typed array constructors.
 */
module.exports = function availableTypedArrays() {
	const availableArrayTypes = [];
	for (let i = 0; i < possibleNames.length; i++) {
		if (typeof globalScope[possibleNames[i]] === 'function') {
			availableArrayTypes.push(possibleNames[i]);
		}
	}
	return availableArrayTypes;
};
