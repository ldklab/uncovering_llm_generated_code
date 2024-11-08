'use strict';

module.exports = rfdc;

function copyBuffer(current) {
  if (current instanceof Buffer) {
    return Buffer.from(current);
  }
  return new current.constructor(current.buffer.slice(), current.byteOffset, current.length);
}

function rfdc(options = {}) {
  if (options.circles) return rfdcCircles(options);

  const constructorHandlers = new Map([
    [Date, (obj) => new Date(obj)],
    [Map, (obj, fn) => new Map(cloneArray(Array.from(obj), fn))],
    [Set, (obj, fn) => new Set(cloneArray(Array.from(obj), fn))]
  ]);

  if (options.constructorHandlers) {
    for (const [constructor, handler] of options.constructorHandlers) {
      constructorHandlers.set(constructor, handler);
    }
  }

  return options.proto ? cloneWithProto : cloneWithoutProto;

  function cloneArray(array, fn) {
    return array.map(item => {
      if (typeof item !== 'object' || item === null) return item;
      const constructor = item.constructor;
      if (constructor !== Object && constructorHandlers.has(constructor)) {
        return constructorHandlers.get(constructor)(item, fn);
      } else if (ArrayBuffer.isView(item)) {
        return copyBuffer(item);
      } else {
        return fn(item);
      }
    });
  }

  function cloneWithoutProto(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (Array.isArray(object)) return cloneArray(object, cloneWithoutProto);
    
    const newObject = {};
    for (const key in object) {
      if (!Object.hasOwnProperty.call(object, key)) continue;
      const value = object[key];
      newObject[key] = typeof value !== 'object' || value === null ? value :
        cloneObject(value, cloneWithoutProto, constructorHandlers);
    }
    return newObject;
  }

  function cloneWithProto(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (Array.isArray(object)) return cloneArray(object, cloneWithProto);

    const newObject = {};
    for (const key in object) {
      const value = object[key];
      newObject[key] = typeof value !== 'object' || value === null ? value :
        cloneObject(value, cloneWithProto, constructorHandlers);
    }
    return newObject;
  }

  function cloneObject(value, fn, constructorHandlers) {
    const constructor = value.constructor;
    if (constructor !== Object && constructorHandlers.has(constructor)) {
      return constructorHandlers.get(constructor)(value, fn);
    } else if (ArrayBuffer.isView(value)) {
      return copyBuffer(value);
    } else {
      return fn(value);
    }
  }
}

function rfdcCircles(options = {}) {
  const refs = [];
  const refsNew = [];

  const constructorHandlers = initializeConstructorHandlers(options);

  return options.proto ? cloneWithProto : cloneWithoutProto;

  function cloneArrayWithCircles(array, fn) {
    return array.map(item => {
      if (typeof item !== 'object' || item === null) return item;
      return handleItemWithCircles(item, fn);
    });
  }

  function cloneWithoutProto(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (Array.isArray(object)) return cloneArrayWithCircles(object, cloneWithoutProto);

    const newObject = {};
    registerReference(object, newObject);

    for (const key in object) {
      if (!Object.hasOwnProperty.call(object, key)) continue;
      const value = object[key];
      newObject[key] = typeof value !== 'object' || value === null ? value :
        handleItemWithCircles(value, cloneWithoutProto);
    }

    unregisterReference();
    return newObject;
  }

  function cloneWithProto(object) {
    if (typeof object !== 'object' || object === null) return object;
    if (Array.isArray(object)) return cloneArrayWithCircles(object, cloneWithProto);

    const newObject = {};
    registerReference(object, newObject);

    for (const key in object) {
      const value = object[key];
      newObject[key] = typeof value !== 'object' || value === null ? value :
        handleItemWithCircles(value, cloneWithProto);
    }

    unregisterReference();
    return newObject;
  }

  function initializeConstructorHandlers(options) {
    const handlers = new Map([
      [Date, (obj) => new Date(obj)],
      [Map, (obj, fn) => new Map(cloneArrayWithCircles(Array.from(obj), fn))],
      [Set, (obj, fn) => new Set(cloneArrayWithCircles(Array.from(obj), fn))]
    ]);

    if (options.constructorHandlers) {
      for (const [constructor, handler] of options.constructorHandlers) {
        handlers.set(constructor, handler);
      }
    }

    return handlers;
  }

  function registerReference(orig, clone) {
    refs.push(orig);
    refsNew.push(clone);
  }

  function unregisterReference() {
    refs.pop();
    refsNew.pop();
  }

  function handleItemWithCircles(item, fn) {
    const index = refs.indexOf(item);
    if (index !== -1) {
      return refsNew[index];
    }
    if (ArrayBuffer.isView(item)) {
      return copyBuffer(item);
    }
    return cloneObjectWithCircles(item, fn, constructorHandlers);
  }

  function cloneObjectWithCircles(value, fn, constructorHandlers) {
    const constructor = value.constructor;
    if (constructor !== Object && constructorHandlers.has(constructor)) {
      return constructorHandlers.get(constructor)(value, fn);
    }
    return fn(value);
  }
}
