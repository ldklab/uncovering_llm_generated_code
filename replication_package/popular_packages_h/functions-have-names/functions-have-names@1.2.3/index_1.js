'use strict';

function functionsHaveNames() {
    return typeof function f() {}.name === 'string';
}

let gOPD = Object.getOwnPropertyDescriptor;
if (gOPD) {
    try {
        gOPD([], 'length');
    } catch (e) {
        // IE 8 has a broken gOPD
        gOPD = null;
    }
}

functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
    if (!functionsHaveNames() || !gOPD) {
        return false;
    }
    const desc = gOPD(function () {}, 'name');
    return !!desc && !!desc.configurable;
};

const $bind = Function.prototype.bind;

functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
    return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
};

module.exports = functionsHaveNames;
