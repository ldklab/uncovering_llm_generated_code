'use strict';

const callBind = require('es-abstract/helpers/callBind');

const isFinalizationRegistrySupported = typeof FinalizationRegistry !== 'undefined';
const boundRegister = isFinalizationRegistrySupported ? callBind(FinalizationRegistry.prototype.register) : null;

function isFinalizationRegistry(value) {
	if (!isFinalizationRegistrySupported) {
		return false;
	}
	if (!value || typeof value !== 'object') {
		return false;
	}
	try {
		boundRegister(value, {});
		return true;
	} catch (e) {
		return false;
	}
}

module.exports = isFinalizationRegistry;
