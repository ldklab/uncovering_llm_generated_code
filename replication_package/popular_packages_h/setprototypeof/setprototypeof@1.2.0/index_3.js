'use strict';

module.exports = Object.setPrototypeOf || isProtoSupported() ? setProtoOf : mixinProperties;

function setProtoOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}

function mixinProperties(obj, proto) {
  for (const key of Object.keys(proto)) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = proto[key];
    }
  }
  return obj;
}

function isProtoSupported() {
  return ({ __proto__: [] } instanceof Array);
}
