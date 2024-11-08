'use strict';

function checkFunctionsHaveNames() {
    return typeof (function namedFunction() {}).name === 'string';
}

function getOwnPropertyDescriptorSafe(obj, prop) {
    try {
        return Object.getOwnPropertyDescriptor(obj, prop);
    } catch (e) {
        return null; // For environments like IE8 where gOPD might be broken
    }
}

function checkFunctionsHaveConfigurableNames() {
    if (!checkFunctionsHaveNames() || !getOwnPropertyDescriptorSafe) {
        return false;
    }
    const desc = getOwnPropertyDescriptorSafe(function () {}, 'name');
    return !!desc && !!desc.configurable;
}

function checkBoundFunctionsHaveNames() {
    const bindFunction = Function.prototype.bind;
    return checkFunctionsHaveNames() && typeof bindFunction === 'function' && (function tempFunction() {}).bind().name !== '';
}

checkFunctionsHaveNames.functionsHaveConfigurableNames = checkFunctionsHaveConfigurableNames;
checkFunctionsHaveNames.boundFunctionsHaveNames = checkBoundFunctionsHaveNames;

module.exports = checkFunctionsHaveNames;
