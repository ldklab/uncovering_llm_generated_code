'use strict';

const $BigInt = typeof BigInt !== 'undefined' ? BigInt : undefined;

module.exports = function hasNativeBigInts() {
	return (
		typeof $BigInt === 'function' &&
		typeof BigInt === 'function' &&
		typeof $BigInt(42) === 'bigint' && // eslint-disable-line no-magic-numbers
		typeof BigInt(42) === 'bigint' // eslint-disable-line no-magic-numbers
	);
};
