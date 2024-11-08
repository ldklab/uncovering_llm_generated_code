'use strict';

var defineProperty = require('es-define-property');

var supportsPropertyDescriptors = function supportsPropertyDescriptors() {
	return !!defineProperty;
};

supportsPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	if (!defineProperty) {
		return null;
	}
	try {
		// Attempt to define the length of an empty array to 1
		return defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (error) {
		// If an exception is thrown, it indicates a bug present in older environments
		return true;
	}
};

module.exports = supportsPropertyDescriptors;
