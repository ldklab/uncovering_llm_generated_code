'use strict';

// Define functionsHaveNames to check if functions have name properties
var functionsHaveNames = function functionsHaveNames() {
    return typeof function f() {}.name === 'string';
};

// Attempt to retrieve Object.getOwnPropertyDescriptor
var gOPD = Object.getOwnPropertyDescriptor;
if (gOPD) {
    try {
        gOPD([], 'length');
    } catch (e) {
        // Fallback for older IE versions with broken getOwnPropertyDescriptor
        gOPD = null;
    }
}

// Add method to check if function names are configurable
functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
    return functionsHaveNames() && gOPD && !!gOPD(function () {}, 'name').configurable;
};

// Reference to Function.prototype.bind
var $bind = Function.prototype.bind;

// Add method to check if bound functions retain their names
functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
    return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
};

// Export the functionsHaveNames object
module.exports = functionsHaveNames;
