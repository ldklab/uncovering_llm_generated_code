'use strict';

const possibleNames = require('possible-typed-array-names');

const globalContext = typeof globalThis === 'undefined' ? global : globalThis;

module.exports = function getAvailableTypedArrays() {
	const availableArrays = [];
	for (const name of possibleNames) {
		if (typeof globalContext[name] === 'function') {
			availableArrays.push(name);
		}
	}
	return availableArrays;
};
