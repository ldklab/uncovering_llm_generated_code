'use strict';

const possibleNames = require('possible-typed-array-names');

const globalObj = typeof globalThis === 'undefined' ? global : globalThis;

module.exports = function availableTypedArrays() {
    const availableArrays = [];
    possibleNames.forEach(name => {
        if (typeof globalObj[name] === 'function') {
            availableArrays.push(name);
        }
    });
    return availableArrays;
};
