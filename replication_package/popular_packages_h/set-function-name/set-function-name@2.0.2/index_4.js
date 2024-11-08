'use strict';

const define = require('define-data-property');
const hasDescriptors = require('has-property-descriptors')();
const configurableNames = require('functions-have-names').functionsHaveConfigurableNames();

const $TypeError = require('es-errors/type');

module.exports = function setFunctionName(fn, name) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	const loose = arguments.length > 2 && Boolean(arguments[2]);
	
	if (!loose || configurableNames) {
		hasDescriptors 
			? define(fn, 'name', name, true, true) 
			: define(fn, 'name', name); 
	}

	return fn;
};
