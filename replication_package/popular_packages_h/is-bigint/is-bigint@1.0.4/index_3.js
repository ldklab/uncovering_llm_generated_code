'use strict';

const hasBigInts = require('has-bigints')();

function tryBigIntObject(value) {
	try {
		BigInt.prototype.valueOf.call(value);
		return true;
	} catch (e) {
		return false;
	}
}

function isBigInt(value) {
	const nonBigIntTypes = ['undefined', 'boolean', 'string', 'number', 'symbol', 'function'];

	if (value === null || nonBigIntTypes.includes(typeof value)) {
		return false;
	}

	if (typeof value === 'bigint') {
		return true;
	}

	return tryBigIntObject(value);
}

module.exports = hasBigInts ? isBigInt : () => false;
