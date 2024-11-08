'use strict';

const callBound = require('call-bind/callBound');

const tryGetByteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

function isSharedArrayBuffer(obj) {
  if (!tryGetByteLength) {
    return false;
  }
  
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  try {
    tryGetByteLength(obj);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = isSharedArrayBuffer;
