// This code provides a polyfill for the Array.prototype.findLastIndex method.
// It ensures compatibility across environments that do not natively support this method.

const defineProperty = Object.defineProperty;
const call = Function.prototype.call;

// Returns the findLastIndex method if it exists natively, otherwise provides a polyfill.
function getPolyfill() {
  if (Array.prototype.findLastIndex) {
    return Array.prototype.findLastIndex;
  }
  return function findLastIndex(callback, thisArg) {
    if (this == null) {
      throw new TypeError('Array.prototype.findLastIndex called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    const object = Object(this);
    const length = object.length >>> 0;
    for (let i = length - 1; i >= 0; i--) {
      if (i in object && callback.call(thisArg, object[i], i, object)) {
        return i;
      }
    }
    return -1;
  };
}

// Shims the findLastIndex method into the Array prototype if it does not already exist.
function shimArrayPrototypeFindLastIndex() {
  const polyfill = getPolyfill();
  if (Array.prototype.findLastIndex !== polyfill) {
    defineProperty(Array.prototype, 'findLastIndex', {
      value: polyfill,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  return polyfill;
}

// Uses the polyfill to apply the findLastIndex function to a given array and callback.
function findLastIndex(array, callback, thisArg) {
  return call.call(getPolyfill(), array, callback, thisArg);
}

// Exports the relevant functions and properties for use in other modules.
module.exports = {
  getPolyfill,
  shim: shimArrayPrototypeFindLastIndex,
  implementation: getPolyfill(),
  findLastIndex
};
