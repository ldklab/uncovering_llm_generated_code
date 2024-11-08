// array.prototype.flatmap.js
var define = require('define-properties');

// Polyfill implementation for Array.prototype.flatMap
function flatMapImplementation(array, mapper, thisArg) {
    if (typeof mapper !== 'function') {
        throw new TypeError('mapper is not a function');
    }
    
    const result = [];
    
    array.forEach(function(value, index, arr) {
        const mappedValue = mapper.call(thisArg, value, index, arr);
        if (Array.isArray(mappedValue)) {
            result.push(...mappedValue); // Flatten the array
        } else {
            result.push(mappedValue);
        }
    });
    
    return result;
}

// Function to get the polyfill, returns existing flatMap if present
function getPolyfill() {
    return Array.prototype.flatMap || flatMapImplementation;
}

// Function to apply the polyfill if not present natively
function shimFlatMap() {
    const polyfill = getPolyfill();
    define(Array.prototype, { flatMap: polyfill });
    return polyfill;
}

module.exports = flatMapImplementation;
module.exports.shim = shimFlatMap;
module.exports.getPolyfill = getPolyfill;
