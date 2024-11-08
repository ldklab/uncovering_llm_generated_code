// array.prototype.flatmap.js
var define = require('define-properties');
var callBind = require('es-abstract/helpers/callBind');
var bind = callBind(
    Function.prototype.call,
    Array.prototype.forEach
);

var flatMapImplementation = function flatMap(array, mapper, thisArg) {
    if (typeof mapper !== 'function') {
        throw new TypeError('mapper is not a function');
    }
    var result = [];
    bind(array, function (value, index, arr) {
        var mappedValue = mapper.call(thisArg, value, index, arr);
        if (Array.isArray(mappedValue)) {
            result.push.apply(result, mappedValue);
        } else {
            result.push(mappedValue);
        }
    });
    return result;
};

var getPolyfill = function getPolyfill() {
    if (Array.prototype.flatMap) {
        return Array.prototype.flatMap;
    }
    return flatMapImplementation;
};

var shim = function shimFlatMap() {
    var polyfill = getPolyfill();
    define(Array.prototype, { flatMap: polyfill });
    return polyfill;
};

module.exports = flatMapImplementation;
module.exports.shim = shim;
module.exports.getPolyfill = getPolyfill;
