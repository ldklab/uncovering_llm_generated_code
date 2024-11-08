// gopd.js
'use strict';

var supportsDescriptors = !!Object.getOwnPropertyDescriptor;

function getOwnPropertyDescriptorIEPolyfill(obj, prop) {
	if (obj == null) { // implicit null and undefined check
		throw new TypeError('Cannot convert undefined or null to object');
	}
	
	// Convert to an object
	obj = Object(obj);

	// If the property is not directly present in the object, return undefined
	if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
		return undefined;
	}

	return {
		value: obj[prop],
		writable: true,
		enumerable: true,
		configurable: true
	};
}

var gOPD = supportsDescriptors ? Object.getOwnPropertyDescriptor : getOwnPropertyDescriptorIEPolyfill;

module.exports = gOPD;
