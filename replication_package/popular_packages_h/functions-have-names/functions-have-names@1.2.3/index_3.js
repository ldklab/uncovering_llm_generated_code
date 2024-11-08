'use strict';

function functionsHaveNames() {
	return typeof function f() {}.name === 'string';
}

let gOPD;
try {
	gOPD = Object.getOwnPropertyDescriptor;
	gOPD([], 'length');
} catch (e) {
	// Handle gOPD issue in older environments like IE 8
	gOPD = null;
}

functionsHaveNames.functionsHaveConfigurableNames = function() {
	if (!functionsHaveNames() || !gOPD) {
		return false;
	}
	const desc = gOPD(function () {}, 'name');
	return !!desc && desc.configurable;
};

const $bind = Function.prototype.bind;

functionsHaveNames.boundFunctionsHaveNames = function() {
	return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
};

module.exports = functionsHaveNames;
