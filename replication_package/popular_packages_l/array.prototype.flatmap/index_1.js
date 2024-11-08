// array.prototype.flatmap.js
const defineProperties = require('define-properties');

function flatMapImplementation(array, mapper, thisArg) {
    if (typeof mapper !== 'function') {
        throw new TypeError('mapper is not a function');
    }
    const result = [];
    array.forEach(function(value, index, arr) {
        const mappedValue = mapper.call(thisArg, value, index, arr);
        if (Array.isArray(mappedValue)) {
            result.push(...mappedValue);
        } else {
            result.push(mappedValue);
        }
    });
    return result;
}

function getPolyfill() {
    return Array.prototype.flatMap || flatMapImplementation;
}

function shimFlatMap() {
    const polyfill = getPolyfill();
    defineProperties(Array.prototype, { flatMap: polyfill });
    return polyfill;
}

module.exports = flatMapImplementation;
module.exports.shim = shimFlatMap;
module.exports.getPolyfill = getPolyfill;
