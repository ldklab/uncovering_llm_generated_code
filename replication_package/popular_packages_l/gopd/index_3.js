// gopd.js
'use strict';

// Check if the environment supports Object.getOwnPropertyDescriptor
const hasNativeSupport = Boolean(Object.getOwnPropertyDescriptor);

// Polyfill for environments that lack descriptor support
function polyfillGetOwnPropertyDescriptor(obj, prop) {
	if (obj == null) {
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

// Use the native method if available, otherwise fallback to polyfill
const getOwnPropertyDescriptor = hasNativeSupport ? Object.getOwnPropertyDescriptor : polyfillGetOwnPropertyDescriptor;

// Export the chosen method
module.exports = getOwnPropertyDescriptor;
