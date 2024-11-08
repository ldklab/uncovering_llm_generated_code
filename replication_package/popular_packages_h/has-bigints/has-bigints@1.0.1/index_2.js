'use strict';

const { BigInt: globalBigInt } = global;

module.exports = function hasNativeBigInts() {
	return typeof globalBigInt === 'function'
		&& typeof BigInt === 'function'
		&& typeof globalBigInt(42) === 'bigint'
		&& typeof BigInt(42) === 'bigint';
};
