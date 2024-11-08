'use strict';

const isString = require('is-string');
const isNumber = require('is-number-object');
const isBoolean = require('is-boolean-object');
const isSymbol = require('is-symbol');
const isBigInt = require('is-bigint');

module.exports = function whichBoxedPrimitive(value) {
	if (value == null || (typeof value !== 'object' && typeof value !== 'function')) {
		return null;
	}

	if (isString(value)) return 'String';
	if (isNumber(value)) return 'Number';
	if (isBoolean(value)) return 'Boolean';
	if (isSymbol(value)) return 'Symbol';
	if (isBigInt(value)) return 'BigInt';

	return null; // explicitly return null if no conditions are met
};
