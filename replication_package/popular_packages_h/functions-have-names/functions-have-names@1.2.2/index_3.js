'use strict';

function functionsHaveNames() {
    return typeof function testFunction() {}.name === 'string';
}

let gOPD = Object.getOwnPropertyDescriptor;

if (gOPD) {
    try {
        gOPD([], 'length');
    } catch (e) {
        // Handle broken gOPD in IE8
        gOPD = null;
    }
}

functionsHaveNames.functionsHaveConfigurableNames = function() {
    return functionsHaveNames() && gOPD && !!gOPD(function () {}, 'name').configurable;
};

const $bind = Function.prototype.bind;

functionsHaveNames.boundFunctionsHaveNames = function() {
    return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
};

module.exports = functionsHaveNames;
