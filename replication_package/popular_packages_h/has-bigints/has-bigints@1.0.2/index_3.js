'use strict';

const isBigIntSupported = typeof BigInt !== 'undefined';

module.exports = function hasNativeBigInts() {
	if (!isBigIntSupported) {
		return false;
	}

	// Create a BigInt to verify its typeof
	const exampleBigInt = BigInt(42); // eslint-disable-line no-magic-numbers

	return typeof BigInt === 'function' && typeof exampleBigInt === 'bigint';
};
