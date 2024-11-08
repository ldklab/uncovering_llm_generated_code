'use strict';

const define = require('define-data-property');
const hasDescriptors = require('has-property-descriptors')();
const functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();

const $TypeError = require('es-errors/type');

/**
 * Sets the name of the specified function.
 * @param {Function} fn - The function to set the name for.
 * @param {string} name - The name to set for the function.
 * @param {boolean} [loose] - If true, skips name setting unless configurable.
 * @returns {Function} The original function with the new name set.
 * @throws {TypeError} Throws if `fn` is not a function.
 */
module.exports = function setFunctionName(fn, name, loose) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	const shouldSetName = !loose || functionsHaveConfigurableNames;
	if (shouldSetName) {
		if (hasDescriptors) {
			define(fn, 'name', name, true, true);
		} else {
			define(fn, 'name', name);
		}
	}
	return fn;
};
