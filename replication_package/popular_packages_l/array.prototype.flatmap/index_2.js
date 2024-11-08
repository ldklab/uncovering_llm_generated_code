// array.prototype.flatmap.js

const define = require('define-properties');
const callBind = require('es-abstract/helpers/callBind');

const flatMapImplementation = function(array, mapper, thisArg) {
    if (typeof mapper !== 'function') {
        throw new TypeError('mapper is not a function');
    }
    
    const result = [];
    const forEach = callBind(Function.prototype.call, Array.prototype.forEach);
    
    forEach(array, function(value, index, arr) {
        const mappedValue = mapper.call(thisArg, value, index, arr);
        
        if (Array.isArray(mappedValue)) {
            result.push(...mappedValue);
        } else {
            result.push(mappedValue);
        }
    });
    
    return result;
};

const getPolyfill = function() {
    return Array.prototype.flatMap || flatMapImplementation;
};

const shim = function() {
    const polyfill = getPolyfill();
    define(Array.prototype, { flatMap: polyfill });
    return polyfill;
};

module.exports = flatMapImplementation;
module.exports.shim = shim;
module.exports.getPolyfill = getPolyfill;
