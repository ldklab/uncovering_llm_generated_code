'use strict';

/**
 * Utility function to check if a value is an ArrayBuffer.
 * @param {*} value - The value to test.
 * @returns {boolean} - Returns true if the value is an ArrayBuffer, otherwise false.
 */
function isArrayBuffer(value) {
  const hasArrayBuffer = typeof ArrayBuffer === 'function';
  return hasArrayBuffer && (value instanceof ArrayBuffer || Object.prototype.toString.call(value) === '[object ArrayBuffer]');
}

module.exports = isArrayBuffer;
