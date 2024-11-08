'use strict';

module.exports = function availableTypedArrays() {
	// List of typed array constructor names to check for
	const typedArrayConstructors = [
		'BigInt64Array',
		'BigUint64Array',
		'Float32Array',
		'Float64Array',
		'Int16Array',
		'Int32Array',
		'Int8Array',
		'Uint16Array',
		'Uint32Array',
		'Uint8Array',
		'Uint8ClampedArray'
	];

	// Filter and return only the typed arrays that exist as constructors in the global scope
	return typedArrayConstructors.filter(typedArray => typeof global[typedArray] === 'function');
};
