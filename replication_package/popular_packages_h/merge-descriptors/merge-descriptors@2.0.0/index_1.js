'use strict';

function mergeDescriptors(destination, source, overwrite = true) {
	if (destination == null) {
		throw new TypeError('The `destination` argument is required.');
	}

	if (source == null) {
		throw new TypeError('The `source` argument is required.');
	}

	for (const key of Object.getOwnPropertyNames(source)) {
		if (overwrite || !Object.hasOwn(destination, key)) {
			const descriptor = Object.getOwnPropertyDescriptor(source, key);
			Object.defineProperty(destination, key, descriptor);
		}
	}

	return destination;
}

module.exports = mergeDescriptors;
