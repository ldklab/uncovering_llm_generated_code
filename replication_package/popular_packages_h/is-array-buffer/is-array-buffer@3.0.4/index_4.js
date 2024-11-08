'use strict';

const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const GetIntrinsic = require('get-intrinsic');

const $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);
const $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);
const $toString = callBound('Object.prototype.toString');

const abSlice = $ArrayBuffer && !$byteLength && new $ArrayBuffer(0).slice;
const $abSlice = abSlice && callBind(abSlice);

function isArrayBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    try {
        if ($byteLength) {
            $byteLength(obj); // Attempt to access byteLength
        } else if ($abSlice) {
            $abSlice(obj, 0); // Attempt to use the slice method
        } else if ($ArrayBuffer) {
            return $toString(obj) === '[object ArrayBuffer]'; // Use Object.prototype.toString
        }
        return true;
    } catch (e) {
        return false;
    }
    return false;
}

module.exports = isArrayBuffer;
