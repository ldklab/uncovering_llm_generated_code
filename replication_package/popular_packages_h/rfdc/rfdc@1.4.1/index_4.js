'use strict';

module.exports = rfdc;

function copyBuffer(cur) {
  if (cur instanceof Buffer) {
    return Buffer.from(cur);
  }
  return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
}

function rfdc(opts) {
  opts = opts || {};
  if (opts.circles) return rfdcCircles(opts);

  const constructorHandlers = new Map([
    [Date, o => new Date(o)],
    [Map, (o, fn) => new Map(cloneArray(Array.from(o), fn))],
    [Set, (o, fn) => new Set(cloneArray(Array.from(o), fn))]
  ]);

  if (opts.constructorHandlers) {
    for (const [constructor, handler] of opts.constructorHandlers) {
      constructorHandlers.set(constructor, handler);
    }
  }

  return opts.proto ? cloneWithProto : clone;

  function cloneArray(arr, fn) {
    return arr.map(item => {
      if (!isObject(item)) return item;
      let handler = constructorHandlers.get(item.constructor);
      if (handler) return handler(item, fn);
      if (ArrayBuffer.isView(item)) return copyBuffer(item);
      return fn(item);
    });
  }

  function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  function clone(obj) {
    if (!isObject(obj)) return obj;
    if (Array.isArray(obj)) return cloneArray(obj, clone);
    let handler = constructorHandlers.get(obj.constructor);
    if (handler) return handler(obj, clone);
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = isObject(obj[key]) ? clone(obj[key]) : obj[key];
      return acc;
    }, {});
  }

  function cloneWithProto(obj) {
    if (!isObject(obj)) return obj;
    if (Array.isArray(obj)) return cloneArray(obj, cloneWithProto);
    let handler = constructorHandlers.get(obj.constructor);
    if (handler) return handler(obj, cloneWithProto);
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), clone(obj));
  }
}

function rfdcCircles(opts) {
  const refs = [];
  const refsNew = [];

  const constructorHandlers = new Map([
    [Date, o => new Date(o)],
    [Map, (o, fn) => new Map(cloneArray(Array.from(o), fn))],
    [Set, (o, fn) => new Set(cloneArray(Array.from(o), fn))]
  ]);

  if (opts.constructorHandlers) {
    for (const [constructor, handler] of opts.constructorHandlers) {
      constructorHandlers.set(constructor, handler);
    }
  }

  return opts.proto ? cloneProtoWithCircles : cloneWithCircles;

  function cloneArray(arr, fn) {
    return arr.map(item => {
      if (!isObject(item)) return item;
      let handler = constructorHandlers.get(item.constructor);
      if (handler) return handler(item, fn);
      if (ArrayBuffer.isView(item)) return copyBuffer(item);
      let idx = refs.indexOf(item);
      return idx !== -1 ? refsNew[idx] : fn(item);
    });
  }

  function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
  }

  function handleCircular(obj, cloneFn) {
    const idx = refs.indexOf(obj);
    if (idx !== -1) return refsNew[idx];
    const result = Array.isArray(obj) ? [] : {};
    refs.push(obj);
    refsNew.push(result);
    cloneFn(obj, result);
    refs.pop();
    refsNew.pop();
    return result;
  }

  function cloneWithCircles(obj) {
    if (!isObject(obj)) return obj;
    return handleCircular(obj, (src, dest) => {
      if (Array.isArray(src)) {
        cloneArray(src, cloneWithCircles).forEach((item, index) => dest[index] = item);
      } else {
        Object.keys(src).forEach(key => {
          dest[key] = isObject(src[key]) ? cloneWithCircles(src[key]) : src[key];
        });
      }
    });
  }

  function cloneProtoWithCircles(obj) {
    if (!isObject(obj)) return obj;
    const protoObj = Object.create(Object.getPrototypeOf(obj));
    return handleCircular(obj, (src, dest) => {
      if (Array.isArray(src)) {
        cloneArray(src, cloneProtoWithCircles).forEach((item, index) => dest[index] = item);
      } else {
        Object.keys(src).forEach(key => {
          dest[key] = isObject(src[key]) ? cloneProtoWithCircles(src[key]) : src[key];
        });
      }
      Object.setPrototypeOf(dest, protoObj);
    });
  }
}
