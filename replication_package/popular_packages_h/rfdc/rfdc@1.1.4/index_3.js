'use strict';

module.exports = cloneDeep;

function cloneDeep(options = {}) {
  return options.circles ? cloneWithCircles(options) : (options.proto ? cloneKeepProto : cloneBasic);

  function cloneBasic(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(cloneBasic);
    
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = isObject(obj[key]) ? cloneBasic(obj[key]) : obj[key];
      }
    }
    return newObj;
  }

  function cloneKeepProto(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(cloneKeepProto);

    const newObj = Object.create(Object.getPrototypeOf(obj));
    for (const key in obj) {
      newObj[key] = isObject(obj[key]) ? cloneKeepProto(obj[key]) : obj[key];
    }
    return newObj;
  }

  function cloneWithCircles(options) {
    const seenObjects = new Map();

    return options.proto ? cloneWithProtoAndCircles : cloneWithCirclesOnly;

    function cloneWithCirclesOnly(obj) {
      if (!isObject(obj)) return obj;
      if (obj instanceof Date) return new Date(obj);

      if (seenObjects.has(obj)) return seenObjects.get(obj);

      const clone = Array.isArray(obj) ? [] : {};
      seenObjects.set(obj, clone);
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clone[key] = isObject(obj[key]) ? cloneWithCirclesOnly(obj[key]) : obj[key];
        }
      }

      return clone;
    }

    function cloneWithProtoAndCircles(obj) {
      if (!isObject(obj)) return obj;
      if (obj instanceof Date) return new Date(obj);

      if (seenObjects.has(obj)) return seenObjects.get(obj);

      const clone = Array.isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj));
      seenObjects.set(obj, clone);

      for (const key in obj) {
        clone[key] = isObject(obj[key]) ? cloneWithProtoAndCircles(obj[key]) : obj[key];
      }

      return clone;
    }
  }

  function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  }
}
