'use strict';

module.exports = function rfdc(opts = {}) {
  if (opts.circles) return cloneWithCircles(opts);
  return opts.proto ? clonePrototype : cloneStandard;

  function cloneArray(array, cloneFunc) {
    const keys = Object.keys(array);
    const newArray = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const current = array[key];
      if (typeof current !== 'object' || current === null) {
        newArray[key] = current;
      } else if (current instanceof Date) {
        newArray[key] = new Date(current);
      } else {
        newArray[key] = cloneFunc(current);
      }
    }
    return newArray;
  }

  function cloneStandard(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (object instanceof Date) return new Date(object);
    if (Array.isArray(object)) return cloneArray(object, cloneStandard);

    const newObj = {};
    for (const key in object) {
      if (!Object.hasOwnProperty.call(object, key)) continue;
      const current = object[key];
      if (typeof current !== 'object' || current === null) {
        newObj[key] = current;
      } else if (current instanceof Date) {
        newObj[key] = new Date(current);
      } else {
        newObj[key] = cloneStandard(current);
      }
    }
    return newObj;
  }

  function clonePrototype(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (object instanceof Date) return new Date(object);
    if (Array.isArray(object)) return cloneArray(object, clonePrototype);

    const newObj = {};
    for (const key in object) {
      const current = object[key];
      if (typeof current !== 'object' || current === null) {
        newObj[key] = current;
      } else if (current instanceof Date) {
        newObj[key] = new Date(current);
      } else {
        newObj[key] = clonePrototype(current);
      }
    }
    return newObj;
  }
}

function cloneWithCircles(opts) {
  const refs = [];
  const refsNew = [];

  return opts.proto ? cloneProto : cloneStandard;

  function cloneArray(array, cloneFunc) {
    const keys = Object.keys(array);
    const newArray = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const current = array[key];
      if (typeof current !== 'object' || current === null) {
        newArray[key] = current;
      } else if (current instanceof Date) {
        newArray[key] = new Date(current);
      } else {
        const index = refs.indexOf(current);
        if (index !== -1) {
          newArray[key] = refsNew[index];
        } else {
          newArray[key] = cloneFunc(current);
        }
      }
    }
    return newArray;
  }

  function cloneStandard(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (object instanceof Date) return new Date(object);
    if (Array.isArray(object)) return cloneArray(object, cloneStandard);

    const newObj = {};
    refs.push(object);
    refsNew.push(newObj);
    for (const key in object) {
      if (!Object.hasOwnProperty.call(object, key)) continue;
      const current = object[key];
      if (typeof current !== 'object' || current === null) {
        newObj[key] = current;
      } else if (current instanceof Date) {
        newObj[key] = new Date(current);
      } else {
        const i = refs.indexOf(current);
        if (i !== -1) {
          newObj[key] = refsNew[i];
        } else {
          newObj[key] = cloneStandard(current);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return newObj;
  }

  function cloneProto(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (object instanceof Date) return new Date(object);
    if (Array.isArray(object)) return cloneArray(object, cloneProto);

    const newObj = {};
    refs.push(object);
    refsNew.push(newObj);
    for (const key in object) {
      const current = object[key];
      if (typeof current !== 'object' || current === null) {
        newObj[key] = current;
      } else if (current instanceof Date) {
        newObj[key] = new Date(current);
      } else {
        const i = refs.indexOf(current);
        if (i !== -1) {
          newObj[key] = refsNew[i];
        } else {
          newObj[key] = cloneProto(current);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return newObj;
  }
}
