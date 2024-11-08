'use strict';
/* eslint no-proto: 0 */

function setProtoOf(obj, proto) {
  obj.__proto__ = proto;
  return obj;
}

function mixinProperties(obj, proto) {
  for (let prop in proto) {
    if (!Object.prototype.hasOwnProperty.call(obj, prop)) {
      obj[prop] = proto[prop];
    }
  }
  return obj;
}

const setPrototype = (() => {
  if (typeof Object.setPrototypeOf === 'function') {
    return Object.setPrototypeOf;
  } 
  if ({ __proto__: [] } instanceof Array) {
    return setProtoOf;
  }
  return mixinProperties;
})();

module.exports = setPrototype;
