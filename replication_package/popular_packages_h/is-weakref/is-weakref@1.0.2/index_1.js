'use strict';

const callBound = require('call-bind/callBound');

const derefMethod = callBound('WeakRef.prototype.deref', true);

function isWeakRef(value) {
	if (typeof WeakRef === 'undefined') {
		// WeakRef is not defined in the current environment
		return false;
	}

	if (!value || typeof value !== 'object') {
		// Value is either null or not an object
		return false;
	}

	try {
		derefMethod(value);
		// Calling `deref` succeeded, so it is a WeakRef
		return true;
	} catch {
		// Error when calling `deref`, so not a WeakRef
		return false;
	}
}

module.exports = isWeakRef;
