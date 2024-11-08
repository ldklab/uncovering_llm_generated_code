'use strict';

const globalBigInt = global.BigInt;

function checkNativeBigIntSupport() {
	return typeof globalBigInt === 'function'
		&& typeof BigInt === 'function'
		&& typeof globalBigInt(42) === 'bigint'
		&& typeof BigInt(42) === 'bigint';
}

module.exports = checkNativeBigIntSupport;
