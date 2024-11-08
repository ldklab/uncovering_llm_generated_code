'use strict';

var callBind = require('es-abstract/helpers/callBind');

// Determine availability of FinalizationRegistry and prepare the bound register method
var isFinalizationRegistrySupported = typeof FinalizationRegistry !== 'undefined';
var boundRegister = isFinalizationRegistrySupported ? callBind(FinalizationRegistry.prototype.register) : null;

module.exports = function isFinalizationRegistry(value) {
	if (!isFinalizationRegistrySupported) {
		// FinalizationRegistry is not supported, always return false
		return false;
	}

	// Check if the value is a non-null object
	if (!value || typeof value !== 'object') {
		return false;
	}

	try {
		// Attempt to call the register method on the value
		boundRegister(value, {});
		return true; // If successful, value is a FinalizationRegistry
	} catch (e) {
		return false; // If an error occurs, value is not a FinalizationRegistry
	}
};
