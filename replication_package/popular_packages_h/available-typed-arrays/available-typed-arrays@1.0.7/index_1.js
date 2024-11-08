'use strict';

const possibleNames = require('possible-typed-array-names');

const g = typeof globalThis !== 'undefined' ? globalThis : global;

module.exports = function availableTypedArrays() {
	const availableArrays = [];
	
	possibleNames.forEach(name => {
		if (typeof g[name] === 'function') {
			availableArrays.push(name);
		}
	});

	return availableArrays;
};
