'use strict';

module.exports = rfdc;

function copyBuffer(cur) {
  if (cur instanceof Buffer) {
    return Buffer.from(cur);
  }
  return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
}

function rfdc(opts = {}) {
  const { circles, proto, constructorHandlers: userHandlers = [] } = opts;
  if (circles) return createCloneFunctionWithReferences(proto, userHandlers);

  const constructorHandlers = createDefaultHandlers(userHandlers);

  return proto ? createCloneFunctionWithProto(constructorHandlers) : createCloneFunction(constructorHandlers);
}

function createDefaultHandlers(userHandlers) {
  const handlers = new Map();
  handlers.set(Date, (o) => new Date(o));
  handlers.set(Map, (o, fn) => new Map(cloneArray(Array.from(o), fn)));
  handlers.set(Set, (o, fn) => new Set(cloneArray(Array.from(o), fn)));
  for (const [constructor, handler] of userHandlers) {
    handlers.set(constructor, handler);
  }
  return handlers;
}

function cloneArray(arr, fn, constructorHandlers) {
  return arr.map((item) => {
    if (typeof item !== 'object' || item === null) return item;
    if (ArrayBuffer.isView(item)) return copyBuffer(item);
    const handler = constructorHandlers.get(item.constructor);
    return handler ? handler(item, fn) : fn(item);
  });
}

function createCloneFunction(constructorHandlers) {
  function clone(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return cloneArray(obj, clone, constructorHandlers);
    
    const clonedObj = {};
    for (const key in obj) {
      if (!Object.hasOwnProperty.call(obj, key)) continue;
      const cur = obj[key];
      if (typeof cur !== 'object' || cur === null) {
        clonedObj[key] = cur;
      } else {
        const handler = constructorHandlers.get(cur.constructor);
        clonedObj[key] = handler ? handler(cur, clone) : clone(cur);
      }
    }
    return clonedObj;
  }
  return clone;
}

function createCloneFunctionWithProto(constructorHandlers) {
  function cloneProto(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return cloneArray(obj, cloneProto, constructorHandlers);
    
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    for (const key in obj) {
      const cur = obj[key];
      if (typeof cur !== 'object' || cur === null) {
        clonedObj[key] = cur;
      } else {
        const handler = constructorHandlers.get(cur.constructor);
        clonedObj[key] = handler ? handler(cur, cloneProto) : cloneProto(cur);
      }
    }
    return clonedObj;
  }
  return cloneProto;
}

function createCloneFunctionWithReferences(proto, userHandlers) {
  const refs = new WeakMap();

  const constructorHandlers = createDefaultHandlers(userHandlers);

  function clone(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    const cachedClone = refs.get(obj);
    if (cachedClone) return cachedClone;

    if (Array.isArray(obj)) {
      const clonedArr = [];
      refs.set(obj, clonedArr);
      obj.forEach((item, index) => {
        clonedArr[index] = typeof item === 'object' && item !== null ? clone(item) : item;
      });
      return clonedArr;
    }
    
    const clonedObj = proto ? Object.create(Object.getPrototypeOf(obj)) : {};
    refs.set(obj, clonedObj);
    for (const key in obj) {
      if (!Object.hasOwnProperty.call(obj, key)) continue;
      const cur = obj[key];
      const handler = constructorHandlers.get(cur.constructor);
      clonedObj[key] = handler ? handler(cur, clone) : typeof cur === 'object' && cur !== null ? clone(cur) : cur;
    }
    return clonedObj;
  }
  
  return clone;
}
