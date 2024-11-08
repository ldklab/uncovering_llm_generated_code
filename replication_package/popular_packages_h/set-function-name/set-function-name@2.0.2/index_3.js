'use strict';

const define = require('define-data-property');
const hasDescriptors = require('has-property-descriptors')();
const functionsHaveConfigurableNames = require('functions-have-names').functionsHaveConfigurableNames();
const $TypeError = require('es-errors/type');

module.exports = function setFunctionName(fn, name, loose = false) {
    if (typeof fn !== 'function') {
        throw new $TypeError('`fn` is not a function');
    }

    if (!loose || functionsHaveConfigurableNames) {
        if (hasDescriptors) {
            define(fn, 'name', name, true, true);
        } else {
            define(fn, 'name', name);
        }
    }
    
    return fn;
};
