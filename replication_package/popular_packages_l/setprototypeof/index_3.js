// setPrototypeOf.js

function setPrototypeOf(obj, proto) {
  if (typeof Object.setPrototypeOf === 'function') {
    // Utilize native method if available
    return Object.setPrototypeOf(obj, proto);
  }

  if ('__proto__' in {}) {
    // Fallback for environments with __proto__ support
    obj.__proto__ = proto;
    return obj;
  }

  // Manual fallback for legacy browsers
  var currentProto = Object.getPrototypeOf(obj);
  var inheritedKeys = Object.keys(proto);

  for (var key of inheritedKeys) {
    obj[key] = proto[key];
  }

  for (var key of Object.keys(currentProto)) {
    if (!(key in proto)) {
      obj[key] = currentProto[key];
    }
  }

  return obj;
}

module.exports = setPrototypeOf;
