// gopd.js
'use strict';

const hasDescriptors = typeof Object.getOwnPropertyDescriptor === 'function';

function polyfillGetOwnPropertyDescriptor(obj, prop) {
	if (obj === null || obj === undefined) {
		throw new TypeError('Cannot convert undefined or null to object');
	}

	const objectified = Object(obj);

	if (!Object.prototype.hasOwnProperty.call(objectified, prop)) {
		return undefined;
	}

	return {
		value: objectified[prop],
		writable: true,
		enumerable: true,
		configurable: true
	};
}

const getOwnPropertyDescriptor = hasDescriptors 
	? Object.getOwnPropertyDescriptor 
	: polyfillGetOwnPropertyDescriptor;

module.exports = getOwnPropertyDescriptor;
