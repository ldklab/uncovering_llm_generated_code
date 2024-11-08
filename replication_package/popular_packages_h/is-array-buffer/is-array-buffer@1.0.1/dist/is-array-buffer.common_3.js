/*!
 * isArrayBuffer v1.0.1
 * https://github.com/fengyuanchen/is-array-buffer
 *
 * Copyright (c) 2015-2018 Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2018-04-01T07:19:08.136Z
 */

'use strict';

const hasArrayBuffer = typeof ArrayBuffer === 'function';
const toString = Object.prototype.toString;

/**
 * Determine whether a given value is an ArrayBuffer.
 * @param {*} value - The value to test.
 * @returns {boolean} True if the value is an ArrayBuffer; otherwise, false.
 */
function isArrayBuffer(value) {
  return hasArrayBuffer && (
    value instanceof ArrayBuffer || 
    toString.call(value) === '[object ArrayBuffer]'
  );
}

module.exports = isArrayBuffer;
