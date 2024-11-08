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
	if (!value || typeof value === 'boolean' || typeof value === 'string' ||
		typeof value === 'number' || typeof value === 'symbol' || typeof value === 'function') {
		return false;
	}
	if (typeof value === 'bigint') {
		return true;
	}
	return tryBigIntObject(value);
}

module.exports = hasBigInts ? isBigInt : () => false;
