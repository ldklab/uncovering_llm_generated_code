'use strict';

// Check if the environment supports Object.getOwnPropertyDescriptor
const supportsDescriptors = !!Object.getOwnPropertyDescriptor;

// Polyfill for environments without descriptor support (like older IE versions)
function polyfillGetOwnPropertyDescriptor(obj, prop) {
	if (obj == null) { // Check for null or undefined
		throw new TypeError('Cannot convert undefined or null to object');
	}
	
	// Ensure obj is treated as an object
	obj = Object(obj);

	// If the property is not directly present, return undefined
	if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
		return undefined;
	}

	// Return a descriptor with true attributes and the property's value
	return {
		value: obj[prop],
		writable: true,
		enumerable: true,
		configurable: true
	};
}

// Determine which method to export
const getOwnPropertyDescriptor = supportsDescriptors ? Object.getOwnPropertyDescriptor : polyfillGetOwnPropertyDescriptor;

// Export the method
module.exports = getOwnPropertyDescriptor;
