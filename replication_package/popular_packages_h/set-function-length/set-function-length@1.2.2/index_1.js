'use strict';

const GetIntrinsic = require('get-intrinsic');
const defineDataProperty = require('define-data-property');
const hasDescriptors = require('has-property-descriptors')();
const getOwnPropertyDescriptor = require('gopd');

const TypeErrorConstructor = require('es-errors/type');
const MathFloor = GetIntrinsic('%Math.floor%');

/**
 * Set the length property of a function to the specified value.
 * @param {Function} fn - The function whose length is to be set.
 * @param {number} length - The desired length value.
 * @returns {Function} The original function with the modified length property.
 * @throws {TypeError} If the provided function parameter is not a function.
 * @throws {TypeError} If the provided length is not a valid positive 32-bit integer.
 */
module.exports = function modifyFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new TypeErrorConstructor('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || MathFloor(length) !== length) {
		throw new TypeErrorConstructor('`length` must be a positive 32-bit integer');
	}

	const isLooseMode = arguments.length > 2 && !!arguments[2];

	let isLengthConfigurable = true;
	let isLengthWritable = true;

	if ('length' in fn && getOwnPropertyDescriptor) {
		const lengthDescriptor = getOwnPropertyDescriptor(fn, 'length');
		if (lengthDescriptor && !lengthDescriptor.configurable) {
			isLengthConfigurable = false;
		}
		if (lengthDescriptor && !lengthDescriptor.writable) {
			isLengthWritable = false;
		}
	}

	if (isLengthConfigurable || isLengthWritable || !isLooseMode) {
		if (hasDescriptors) {
			defineDataProperty(fn, 'length', length, true, true);
		} else {
			defineDataProperty(fn, 'length', length);
		}
	}

	return fn;
};
