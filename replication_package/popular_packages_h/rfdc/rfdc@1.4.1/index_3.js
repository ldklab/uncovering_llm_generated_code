'use strict';

module.exports = rfdc;

function copyBuffer(cur) {
  if (cur instanceof Buffer) return Buffer.from(cur);
  return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);
}

function rfdc(opts = {}) {
  if (opts.circles) return rfdcCircles(opts);

  const constructorHandlers = new Map([
    [Date, (o) => new Date(o)],
    [Map, (o, fn) => new Map(cloneArray(Array.from(o), fn))],
    [Set, (o, fn) => new Set(cloneArray(Array.from(o), fn))]
  ]);
  
  if (opts.constructorHandlers) {
    for (const handler of opts.constructorHandlers) {
      constructorHandlers.set(handler[0], handler[1]);
    }
  }

  const cloneFunction = opts.proto ? cloneProto : clone;
  return cloneFunction;

  function cloneArray(a, fn) {
    const result = new Array(a.length);
    for (let i = 0, len = a.length; i < len; i++) {
      const cur = a[i];
      result[i] = handleValue(cur, fn);
    }
    return result;
  }

  function clone(o) {
    if (!isObject(o)) return o;
    if (Array.isArray(o)) return cloneArray(o, clone);

    if (constructorHandlers.has(o.constructor)) {
      return constructorHandlers.get(o.constructor)(o, clone);
    }

    return cloneObject(o, clone);
  }

  function cloneProto(o) {
    if (!isObject(o)) return o;
    if (Array.isArray(o)) return cloneArray(o, cloneProto);

    if (constructorHandlers.has(o.constructor)) {
      return constructorHandlers.get(o.constructor)(o, cloneProto);
    }

    return cloneObject(o, cloneProto);
  }

  function cloneObject(o, cloneFn) {
    const result = {};
    for (const key in o) {
      if (Object.hasOwnProperty.call(o, key)) {
        result[key] = handleValue(o[key], cloneFn);
      }
    }
    return result;
  }

  function handleValue(cur, cloneFn) {
    if (!isObject(cur)) return cur;
    if (constructorHandlers.has(cur.constructor)) {
      return constructorHandlers.get(cur.constructor)(cur, cloneFn);
    }
    if (ArrayBuffer.isView(cur)) return copyBuffer(cur);
    return cloneFn(cur);
  }

  function isObject(val) {
    return typeof val === 'object' && val !== null;
  }
}

function rfdcCircles(opts) {
  const refs = [];
  const refsNew = [];
  const constructorHandlers = new Map([
    [Date, (o) => new Date(o)],
    [Map, (o, fn) => new Map(cloneArray(Array.from(o), fn))],
    [Set, (o, fn) => new Set(cloneArray(Array.from(o), fn))]
  ]);

  if (opts.constructorHandlers) {
    for (const handler of opts.constructorHandlers) {
      constructorHandlers.set(handler[0], handler[1]);
    }
  }

  const cloneFunction = opts.proto ? cloneProto : clone;
  return cloneFunction;

  function cloneArray(a, fn) {
    const result = new Array(a.length);
    for (let i = 0, len = a.length; i < len; i++) {
      const cur = a[i];
      result[i] = handleCircularValue(cur, fn);
    }
    return result;
  }

  function clone(o) {
    return cloneInternal(o, clone, handleCircularValue);
  }

  function cloneProto(o) {
    return cloneInternal(o, cloneProto, handleCircularValueProto);
  }

  function cloneInternal(o, cloneFn, handleCircularFn) {
    if (!isObject(o)) return o;
    if (Array.isArray(o)) return cloneArray(o, cloneFn);

    if (constructorHandlers.has(o.constructor)) {
      return constructorHandlers.get(o.constructor)(o, cloneFn);
    }

    const result = {};
    refs.push(o);
    refsNew.push(result);
    for (const key in o) {
      if (Object.hasOwnProperty.call(o, key)) {
        result[key] = handleCircularFn(o[key], cloneFn);
      }
    }
    refs.pop();
    refsNew.pop();
    return result;
  }

  function handleCircularValue(cur, cloneFn) {
    if (!isObject(cur)) return cur;
    const existing = getExistingClone(cur);
    return existing || handleNewCircularValue(cur, cloneFn);
  }

  function handleCircularValueProto(cur, cloneFn) {
    if (!isObject(cur)) return cur;
    const existing = getExistingClone(cur);
    return existing || handleNewCircularValue(cur, cloneFn);
  }

  function handleNewCircularValue(cur, cloneFn) {
    if (ArrayBuffer.isView(cur)) return copyBuffer(cur);
    if (constructorHandlers.has(cur.constructor)) {
      return constructorHandlers.get(cur.constructor)(cur, cloneFn);
    }
    return cloneFn(cur);
  }

  function getExistingClone(cur) {
    const index = refs.indexOf(cur);
    return index > -1 ? refsNew[index] : null;
  }

  function isObject(val) {
    return typeof val === 'object' && val !== null;
  }
}
