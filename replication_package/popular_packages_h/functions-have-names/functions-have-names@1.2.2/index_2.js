'use strict';

function functionsHaveNames() {
    return typeof function exampleFunction() {}.name === 'string';
}

let getOwnPropertyDesc = Object.getOwnPropertyDescriptor;

if (getOwnPropertyDesc) {
    try {
        getOwnPropertyDesc([], 'length');
    } catch (error) {
        // Internet Explorer 8 has a broken getOwnPropertyDescriptor implementation
        getOwnPropertyDesc = null;
    }
}

functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
    if (!functionsHaveNames() || !getOwnPropertyDesc) {
        return false;
    }
    const functionDescriptor = getOwnPropertyDesc(function () {}, 'name');
    return !!functionDescriptor && functionDescriptor.configurable;
};

const functionBind = Function.prototype.bind;

functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
    if (!functionsHaveNames() || typeof functionBind !== 'function') {
        return false;
    }
    return function exampleBound() {}.bind().name !== '';
};

module.exports = functionsHaveNames;
