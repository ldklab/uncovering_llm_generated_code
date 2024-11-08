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

const isArrayBuffer = (function() {
  const hasArrayBuffer = typeof ArrayBuffer === 'function';
  const toString = Object.prototype.toString;

  return function(value) {
    return hasArrayBuffer && (
      value instanceof ArrayBuffer || 
      toString.call(value) === '[object ArrayBuffer]'
    );
  };
})();

module.exports = isArrayBuffer;
