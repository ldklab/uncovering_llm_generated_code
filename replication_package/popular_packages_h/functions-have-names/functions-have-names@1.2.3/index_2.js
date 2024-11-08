'use strict';

// Function to check if functions have a 'name' property
var functionsHaveNames = function() {
    return typeof function() {}.name === 'string';
};

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

if (getOwnPropertyDescriptor) {
    try {
        getOwnPropertyDescriptor([], 'length');
    } catch (e) {
        // If in an environment like IE 8 where gOPD is broken, set it to null
        getOwnPropertyDescriptor = null;
    }
}

// Function to check if function names are configurable
functionsHaveNames.hasConfigurableNames = function() {
    if (!functionsHaveNames() || !getOwnPropertyDescriptor) {
        return false;
    }
    var descriptor = getOwnPropertyDescriptor(function() {}, 'name');
    return !!descriptor && !!descriptor.configurable;
};

var bindFn = Function.prototype.bind;

// Function to check if bound functions have a name property
functionsHaveNames.boundFunctionsHaveNames = function() {
    return functionsHaveNames() && typeof bindFn === 'function' && function() {}.bind().name !== '';
};

module.exports = functionsHaveNames;
