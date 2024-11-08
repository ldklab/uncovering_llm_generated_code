'use strict';

// Import the custom $defineProperty function from the es-define-property module
const $defineProperty = require('es-define-property');

// Function to check if property descriptors are available
const hasPropertyDescriptors = function() {
	// Return a boolean based on the existence of $defineProperty
	return Boolean($defineProperty);
};

// Add a method to check for a specific bug related to array length definition
hasPropertyDescriptors.hasArrayLengthDefineBug = function() {
	// If $defineProperty is not defined, return null
	if (!$defineProperty) {
		return null;
	}
	try {
		// Attempt to define the 'length' property on an array
		// Return true if the operation doesn't work as expected
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// If an exception is thrown (i.e., in certain Firefox versions), return true indicating the bug
		return true;
	}
};

// Export the hasPropertyDescriptors function
module.exports = hasPropertyDescriptors;
