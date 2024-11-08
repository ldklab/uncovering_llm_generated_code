'use strict';

function isFinalizationRegistry(value) {
	if (typeof FinalizationRegistry === 'undefined') {
		return false;
	}
	
	const $register = Function.prototype.call.bind(FinalizationRegistry.prototype.register);

	if (!value || typeof value !== 'object') {
		return false;
	}
	try {
		$register(value, {});
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = isFinalizationRegistry;
