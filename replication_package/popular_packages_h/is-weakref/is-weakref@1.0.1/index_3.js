'use strict';

const callBound = require('call-bind/callBound');

const $deref = callBound('WeakRef.prototype.deref', true);

function isWeakRef(value) {
    if (typeof WeakRef === 'undefined') {
        return false;
    }
    
    if (!value || typeof value !== 'object') {
        return false;
    }
    
    try {
        $deref(value);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = isWeakRef;
