'use strict';

const defineProperty = require('es-define-property');

function hasPropertyDescriptors() {
    return Boolean(defineProperty);
}

hasPropertyDescriptors.hasArrayLengthDefineBug = function() {
    if (!defineProperty) {
        return null;
    }
    try {
        let array = [];
        defineProperty(array, 'length', { value: 1 });
        return array.length !== 1;
    } catch (e) {
        return true;
    }
};

module.exports = hasPropertyDescriptors;
