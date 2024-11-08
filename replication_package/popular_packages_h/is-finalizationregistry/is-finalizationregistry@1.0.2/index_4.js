'use strict';

const callBound = require('call-bind/callBound');

const $register = callBound('FinalizationRegistry.prototype.register', true);

module.exports = function isFinalizationRegistry(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	try {
		if ($register) {
			$register(value, {});
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
};
