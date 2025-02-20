'use strict';

const $defineProperty = require('es-define-property');
const $SyntaxError = require('es-errors/syntax');
const $TypeError = require('es-errors/type');
const gopd = require('gopd');

/**
 * Define a data property on an object with specific characteristics.
 * 
 * @param {object} obj - The object on which to define the property.
 * @param {string|symbol} property - The name or symbol of the property.
 * @param {*} value - The value to set for the property.
 * @param {boolean|null} [nonEnumerable=null] - Optional boolean to specify if property should be non-enumerable.
 * @param {boolean|null} [nonWritable=null] - Optional boolean to specify if property should be non-writable.
 * @param {boolean|null} [nonConfigurable=null] - Optional boolean to specify if property should be non-configurable.
 * @param {boolean} [loose=false] - Optional boolean to indicate if loose settings are allowed.
 */
module.exports = function defineDataProperty(obj, property, value, nonEnumerable = null, nonWritable = null, nonConfigurable = null, loose = false) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	validateOptionalBoolean(nonEnumerable, 'nonEnumerable');
	validateOptionalBoolean(nonWritable, 'nonWritable');
	validateOptionalBoolean(nonConfigurable, 'nonConfigurable');
	validateBoolean(loose, 'loose');
	
	let desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: isConfigurable(nonConfigurable, desc),
			enumerable: isEnumerable(nonEnumerable, desc),
			value: value,
			writable: isWritable(nonWritable, desc)
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}

	function validateOptionalBoolean(param, name) {
		if (param !== null && typeof param !== 'boolean') {
			throw new $TypeError(`\`${name}\`, if provided, must be a boolean or null`);
		}
	}

	function validateBoolean(param, name) {
		if (typeof param !== 'boolean') {
			throw new $TypeError(`\`${name}\`, if provided, must be a boolean`);
		}
	}

	function isConfigurable(nonConfigurable, desc) {
		return nonConfigurable === null && desc ? desc.configurable : !nonConfigurable;
	}

	function isEnumerable(nonEnumerable, desc) {
		return nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable;
	}

	function isWritable(nonWritable, desc) {
		return nonWritable === null && desc ? desc.writable : !nonWritable;
	}
};
