// setPrototypeOf.js

function setPrototypeOf(obj, proto) {
  if (typeof Object.setPrototypeOf === 'function') {
    // Use native `Object.setPrototypeOf`
    Object.setPrototypeOf(obj, proto);
  } else if ({ __proto__: [] } instanceof Array) {
    // Fallback for environments that support `__proto__`
    obj.__proto__ = proto;
  } else {
    // Manual fallback for old browsers that do not support `Object.setPrototypeOf` or `__proto__`
    var oldProto = Object.getPrototypeOf(obj);
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        obj[key] = proto[key];
      }
    }
    if (oldProto !== Object.prototype) {
      for (var key in oldProto) {
        if (oldProto.hasOwnProperty(key) && !(key in proto)) {
          obj[key] = oldProto[key];
        }
      }
    }
  }
  return obj;
}

module.exports = setPrototypeOf;
