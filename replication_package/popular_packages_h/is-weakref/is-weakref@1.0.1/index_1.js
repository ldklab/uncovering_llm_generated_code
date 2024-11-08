'use strict';

const callBound = require('call-bind/callBound');

const derefBound = callBound('WeakRef.prototype.deref', true);

function isWeakRef(value) {
	if (typeof WeakRef === 'undefined') {
		return false;
	}
	if (!value || typeof value !== 'object') {
		return false;
	}
	try {
		derefBound(value);
		return true;
	} catch {
		return false;
	}
}

module.exports = isWeakRef;
