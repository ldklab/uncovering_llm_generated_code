'use strict';

module.exports = function availableTypedArrays() {
	const possibleTypedArrays = [
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

	return possibleTypedArrays.filter(function (typedArray) {
		return typeof global[typedArray] === 'function';
	});
};
