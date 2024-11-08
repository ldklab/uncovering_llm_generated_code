'use strict';

// Function to check if functions have a name property
function functionsHaveNames() {
    return typeof (function namedFunction() {}).name === 'string';
}

let getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Validate gOPD works correctly (accounts for older IE's broken implementation)
if (getOwnPropertyDescriptor) {
    try {
        getOwnPropertyDescriptor([], 'length');
    } catch (e) {
        getOwnPropertyDescriptor = null;
    }
}

// Method to check if function names are configurable
functionsHaveNames.functionsHaveConfigurableNames = function checkConfigurableNames() {
    return functionsHaveNames() && getOwnPropertyDescriptor && !!getOwnPropertyDescriptor(function () {}, 'name').configurable;
};

// Method to check if bound functions have names
functionsHaveNames.boundFunctionsHaveNames = function checkBoundFunctionNames() {
    return functionsHaveNames() && typeof Function.prototype.bind === 'function' && (function () {}).bind().name !== '';
};

// Export the function and its methods
module.exports = functionsHaveNames;
