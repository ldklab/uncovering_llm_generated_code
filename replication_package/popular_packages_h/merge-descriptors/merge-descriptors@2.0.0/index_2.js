'use strict';

function mergeDescriptors(destination, source, overwrite = true) {
	if (!destination) {
		throw new TypeError('The `destination` argument is required.');
	}

	if (!source) {
		throw new TypeError('The `source` argument is required.');
	}

	Object.getOwnPropertyNames(source).forEach(name => {
		if (overwrite || !Object.hasOwn(destination, name)) {
			const descriptor = Object.getOwnPropertyDescriptor(source, name);
			Object.defineProperty(destination, name, descriptor);
		}
	});

	return destination;
}

module.exports = mergeDescriptors;
