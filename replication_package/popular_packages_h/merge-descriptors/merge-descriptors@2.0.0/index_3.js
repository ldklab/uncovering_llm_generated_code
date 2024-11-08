'use strict';

function mergeDescriptors(target, src, allowOverwrite = true) {
	if (!target) {
		throw new TypeError('The `target` argument is required.');
	}

	if (!src) {
		throw new TypeError('The `src` argument is required.');
	}

	for (const key of Object.getOwnPropertyNames(src)) {
		if (!allowOverwrite && Object.hasOwn(target, key)) {
			continue;
		}

		const propDescriptor = Object.getOwnPropertyDescriptor(src, key);
		Object.defineProperty(target, key, propDescriptor);
	}

	return target;
}

module.exports = mergeDescriptors;
