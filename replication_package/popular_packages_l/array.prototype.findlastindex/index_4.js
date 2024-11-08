const defineProperty = Object.defineProperty;
const call = Function.prototype.call;

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

function findLastIndex(array, callback, thisArg) {
  return call.call(getPolyfill(), array, callback, thisArg);
}

module.exports = {
  getPolyfill,
  shim: shimArrayPrototypeFindLastIndex,
  implementation: getPolyfill(),
  findLastIndex
};
