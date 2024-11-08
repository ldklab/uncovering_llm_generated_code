/*!
 * shallow-clone <https://github.com/jonschlinkert/shallow-clone>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const typeOf = require('kind-of');
const valueOf = Symbol.prototype.valueOf;

function clone(val) {
  const valType = typeOf(val);

  if (valType === 'array') {
    return val.slice();
  }

  if (valType === 'object') {
    return Object.assign({}, val);
  }

  if (valType === 'date') {
    return new val.constructor(Number(val));
  }

  if (valType === 'map') {
    return new Map(val);
  }

  if (valType === 'set') {
    return new Set(val);
  }

  if (valType === 'buffer') {
    return cloneBuffer(val);
  }

  if (valType === 'symbol') {
    return cloneSymbol(val);
  }

  if (valType === 'arraybuffer') {
    return cloneArrayBuffer(val);
  }

  if (['float32array', 'float64array', 'int16array', 'int32array', 'int8array', 
       'uint16array', 'uint32array', 'uint8clampedarray', 'uint8array']
      .includes(valType)) {
    return cloneTypedArray(val);
  }

  if (valType === 'regexp') {
    return cloneRegExp(val);
  }

  if (valType === 'error') {
    return Object.create(val);
  }

  return val;
}

function cloneRegExp(val) {
  const flags = val.flags !== undefined ? val.flags : (/\w+$/.exec(val) || undefined);
  const regexClone = new val.constructor(val.source, flags);
  regexClone.lastIndex = val.lastIndex;
  return regexClone;
}

function cloneArrayBuffer(val) {
  const bufferClone = new val.constructor(val.byteLength);
  new Uint8Array(bufferClone).set(new Uint8Array(val));
  return bufferClone;
}

function cloneTypedArray(val) {
  return new val.constructor(val.buffer, val.byteOffset, val.length);
}

function cloneBuffer(val) {
  const bufferClone = Buffer.allocUnsafe ? Buffer.allocUnsafe(val.length) : Buffer.from(val.length);
  val.copy(bufferClone);
  return bufferClone;
}

function cloneSymbol(val) {
  return valueOf ? Object(valueOf.call(val)) : {};
}

module.exports = clone;
