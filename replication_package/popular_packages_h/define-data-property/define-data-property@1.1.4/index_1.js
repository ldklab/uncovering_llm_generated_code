'use strict';

const defineProperty = require('es-define-property');
const SyntaxError = require('es-errors/syntax');
const TypeError = require('es-errors/type');
const getOwnPropertyDescriptor = require('gopd');

/**
 * Defines a data property on an object.
 * @param {Object|Function} obj - The object on which to define the property.
 * @param {string|symbol} property - The property key.
 * @param {*} value - The value to set.
 * @param {boolean|null} [nonEnumerable=null] - If provided, determines if the property is non-enumerable.
 * @param {boolean|null} [nonWritable=null] - If provided, determines if the property is non-writable.
 * @param {boolean|null} [nonConfigurable=null] - If provided, determines if the property is non-configurable.
 * @param {boolean} [loose=false] - If true, applies a loose setting.
 */
module.exports = function defineDataProperty(obj, property, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new TypeError('`property` must be a string or a symbol`');
	}
	if (nonEnumerable !== null && typeof nonEnumerable !== 'boolean') {
		throw new TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (nonWritable !== null && typeof nonWritable !== 'boolean') {
		throw new TypeError('`nonWritable`, if provided, must be a boolean or null');
	}
	if (nonConfigurable !== null && typeof nonConfigurable !== 'boolean') {
		throw new TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (typeof loose !== 'boolean') {
		throw new TypeError('`loose`, if provided, must be a boolean');
	}

	const desc = getOwnPropertyDescriptor(obj, property);

	if (defineProperty) {
		defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		obj[property] = value; 
	} else {
		throw new SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};
