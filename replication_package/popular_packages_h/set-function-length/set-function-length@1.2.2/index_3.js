'use strict';

const GetIntrinsic = require('get-intrinsic');
const define = require('define-data-property');
const hasDescriptors = require('has-property-descriptors')();
const gOPD = require('gopd');

const $TypeError = require('es-errors/type');
const $floor = GetIntrinsic('%Math.floor%');

/**
 * Sets the `length` property of a function if possible.
 *
 * @param {Function} fn - The function whose length property is to be set.
 * @param {number} length - The desired length to set on the function.
 * @param {boolean} [loose=false] - If true, allows setting length even if it's not configurable or writable.
 * @returns {Function} The modified function.
 * @throws {TypeError} If `fn` is not a function or if `length` is not a positive 32-bit integer.
 */
module.exports = function setFunctionLength(fn, length, loose = false) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	let functionLengthIsConfigurable = true;
	let functionLengthIsWritable = true;

	if ('length' in fn && gOPD) {
		const desc = gOPD(fn, 'length');
		if (desc) {
			if (!desc.configurable) {
				functionLengthIsConfigurable = false;
			}
			if (!desc.writable) {
				functionLengthIsWritable = false;
			}
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(fn, 'length', length, true, true);
		} else {
			define(fn, 'length', length);
		}
	}

	return fn;
};
