'use strict';

const callBound = require('call-bind/callBound');

const derefMethod = callBound('WeakRef.prototype.deref', true);

module.exports = (typeof WeakRef === 'undefined')
	? (value) => false
	: (value) => {
		if (!value || typeof value !== 'object') {
			return false;
		}
		try {
			derefMethod(value);
			return true;
		} catch (e) {
			return false;
		}
	};
