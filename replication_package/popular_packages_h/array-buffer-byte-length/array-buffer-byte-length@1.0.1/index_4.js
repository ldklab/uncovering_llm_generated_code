'use strict';

const callBound = require('call-bind/callBound');
const $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);

const isArrayBuffer = require('is-array-buffer');

/** @type {import('.')} */
module.exports = function byteLength(ab) {
    if (!isArrayBuffer(ab)) {
        return NaN;
    }
    return $byteLength ? $byteLength(ab) : ab.byteLength;
}; // in node < 0.11, byteLength is an own nonconfigurable property
