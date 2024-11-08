'use strict';

var callBind = require('es-abstract/helpers/callBind');

var hasFinalizationRegistry = typeof FinalizationRegistry !== 'undefined';
var $register = hasFinalizationRegistry ? callBind(FinalizationRegistry.prototype.register) : null;

function isFinalizationRegistry(value) {
	if (!hasFinalizationRegistry) {
		return false;
	}
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
