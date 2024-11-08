// gopd.js
'use strict';

const supportsDescriptors = !!Object.getOwnPropertyDescriptor;

function getOwnPropertyDescriptorIEPolyfill(obj, prop) {
    if (obj == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }
    
    obj = Object(obj);

    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        return undefined;
    }

    return {
        value: obj[prop],
        writable: true,
        enumerable: true,
        configurable: true
    };
}

const gOPD = supportsDescriptors ? Object.getOwnPropertyDescriptor : getOwnPropertyDescriptorIEPolyfill;

module.exports = gOPD;
