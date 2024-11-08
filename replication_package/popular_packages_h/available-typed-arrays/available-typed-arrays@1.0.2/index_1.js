'use strict';

module.exports = function availableTypedArrays() {
	const typedArrays = [
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

	return typedArrays.filter((typedArray) => typeof global[typedArray] === 'function');
};
