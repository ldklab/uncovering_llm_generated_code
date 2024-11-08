'use strict';

module.exports = (function() {
  if (Object.setPrototypeOf) {
    return Object.setPrototypeOf;
  }

  if ({ __proto__: [] } instanceof Array) {
    return function setProtoOf(obj, proto) {
      obj.__proto__ = proto;
      return obj;
    };
  }

  return function mixinProperties(obj, proto) {
    for (var prop in proto) {
      if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
        obj[prop] = proto[prop];
      }
    }
    return obj;
  };
})();
