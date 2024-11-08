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

function isArrayBuffer(value) {
  return typeof ArrayBuffer === 'function' &&
         (value instanceof ArrayBuffer || Object.prototype.toString.call(value) === '[object ArrayBuffer]');
}

module.exports = isArrayBuffer;
