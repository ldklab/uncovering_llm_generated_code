'use strict';

// Importing a module that helps in defining properties
var $defineProperty = require('es-define-property');

// Function to check if property descriptors are supported
var hasPropertyDescriptors = function() {
	// It checks if the $defineProperty module is available and returns true if it exists
	return !!$defineProperty;
};

// Extend the function to include a method to check for a bug
hasPropertyDescriptors.hasArrayLengthDefineBug = function() {
	// Check specifically for a known bug in Node.js v0.6
	if (!$defineProperty) {
		return null; // If the $defineProperty is not available, return null
	}
	try {
		// Try to define the 'length' property on an array; check if the length is not correctly defined
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// If an error is thrown, which can happen in specific browsers, return true indicating a bug
		return true;
	}
};

// Export the function so it can be used in other modules
module.exports = hasPropertyDescriptors;
