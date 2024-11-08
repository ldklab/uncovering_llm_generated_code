'use strict';

var callBound = require('call-bind/callBound');

var $register = callBound('FinalizationRegistry.prototype.register', true);

function isFinalizationRegistry(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if ($register) {
		try {
			$register(value, {});
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
}

module.exports = isFinalizationRegistry;
