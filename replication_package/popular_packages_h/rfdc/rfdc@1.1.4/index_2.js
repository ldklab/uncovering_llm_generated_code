'use strict';

module.exports = rfdc;

function rfdc(opts = {}) {
  const cloneFunction = opts.circles ? cloneWithCircles : cloneWithoutCircles;
  return opts.proto ? cloneFunction.cloneProto : cloneFunction.clone;
}

function cloneWithoutCircles() {
  return {
    clone: deepClone,
    cloneProto: deepCloneWithoutPrototype,
  };

  function deepClone(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    return cloneObject(obj, deepClone);
  }

  function deepCloneWithoutPrototype(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepCloneWithoutPrototype);
    return cloneObject(obj, deepCloneWithoutPrototype);
  }
}

function cloneWithCircles() {
  const refs = [];
  const refsNew = [];
  
  return {
    clone: deepClone,
    cloneProto: deepCloneWithoutPrototype,
  };

  function deepClone(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);

    const index = refs.indexOf(obj);
    if (index !== -1) return refsNew[index];

    const newObj = Array.isArray(obj)
      ? []
      : {};
    refs.push(obj);
    refsNew.push(newObj);

    if (Array.isArray(obj)) {
      obj.forEach((item, i) => newObj[i] = deepClone(item));
    } else {
      Object.keys(obj).forEach(key => newObj[key] = deepClone(obj[key]));
    }

    refs.pop();
    refsNew.pop();

    return newObj;
  }

  function deepCloneWithoutPrototype(obj) {
    if (!isObject(obj)) return obj;
    if (obj instanceof Date) return new Date(obj);

    const index = refs.indexOf(obj);
    if (index !== -1) return refsNew[index];

    const newObj = Array.isArray(obj)
      ? []
      : {};
    refs.push(obj);
    refsNew.push(newObj);

    if (Array.isArray(obj)) {
      obj.forEach((item, i) => newObj[i] = deepCloneWithoutPrototype(item));
    } else {
      Object.keys(obj).forEach(key => newObj[key] = deepCloneWithoutPrototype(obj[key]));
    }

    refs.pop();
    refsNew.pop();
    
    return newObj;
  }
}

function cloneObject(source, cloneFunction) {
  const result = {};
  for (const key in source) {
    if (Object.hasOwnProperty.call(source, key)) {
      result[key] = cloneFunction(source[key]);
    }
  }
  return result;
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
