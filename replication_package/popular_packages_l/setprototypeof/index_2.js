function setPrototypeOf(obj, proto) {
  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(obj, proto);
  } else if ('__proto__' in obj) {
    obj.__proto__ = proto;
  } else {
    var oldProto = Object.getPrototypeOf(obj);
    Object.keys(proto).forEach(function(key) {
      if (proto.hasOwnProperty(key)) {
        obj[key] = proto[key];
      }
    });
    if (oldProto !== Object.prototype) {
      Object.keys(oldProto).forEach(function(key) {
        if (oldProto.hasOwnProperty(key) && !(key in proto)) {
          obj[key] = oldProto[key];
        }
      });
    }
  }
  return obj;
}

module.exports = setPrototypeOf;
