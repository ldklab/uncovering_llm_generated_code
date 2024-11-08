'use strict';

const hasBigInts = require('has-bigints')();

function tryBigInt(value) {
	try {
		BigInt.prototype.valueOf.call(value);
		return true;
	} catch {
		return false;
	}
}

function isBigInt(value) {
	if (!hasBigInts) {
		return false;
	}
	
	if (typeof value === 'bigint') {
		return true;
	}

	const nonBigIntTypes = ['null', 'undefined', 'boolean', 'string', 'number', 'symbol', 'function'];
	if (value === null || nonBigIntTypes.includes(typeof value)) {
		return false;
	}

	return tryBigInt(value);
}

module.exports = isBigInt;
