function setPrototypeOf(obj, proto) {
  if (typeof Object.setPrototypeOf === 'function') {
    // Use the native `Object.setPrototypeOf`
    Object.setPrototypeOf(obj, proto);
  } else if ('__proto__' in {}) {
    // Fallback for environments with `__proto__`
    obj.__proto__ = proto;
  } else {
    // Manual fallback for environments without `Object.setPrototypeOf` or `__proto__`
    var oldProto = Object.getPrototypeOf(obj);
    Object.keys(proto).forEach(function (key) {
      if (!obj.hasOwnProperty(key)) {
        obj[key] = proto[key];
      }
    });
    if (oldProto !== Object.prototype) {
      Object.keys(oldProto).forEach(function (key) {
        if (!proto.hasOwnProperty(key) && !obj.hasOwnProperty(key)) {
          obj[key] = oldProto[key];
        }
      });
    }
  }
  return obj;
}

module.exports = setPrototypeOf;
