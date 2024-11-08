'use strict';

const hasOwnProperty = require('hasown');

const canUseUnscopables = typeof Symbol === 'function' && typeof Symbol.unscopables === 'symbol';
const unscopablesMap = canUseUnscopables ? Array.prototype[Symbol.unscopables] : null;

module.exports = function addToUnscopables(methodName) {
    if (typeof methodName !== 'string' || methodName.trim() === '') {
        throw new TypeError('The method name must be a non-empty string.');
    }
    if (!hasOwnProperty(Array.prototype, methodName)) {
        throw new TypeError('The method must exist on Array.prototype.');
    }
    if (canUseUnscopables) {
        unscopablesMap[methodName] = true;
    }
};
