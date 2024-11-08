'use strict';

const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const GetIntrinsic = require('get-intrinsic');

const $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);
const $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);
const $toString = callBound('Object.prototype.toString');

const abSliceAvailability = !!$ArrayBuffer && !$byteLength && new $ArrayBuffer(0).slice;
const $abSlice = !!abSliceAvailability && callBind(abSliceAvailability);

module.exports = $byteLength || $abSlice
    ? function isArrayBuffer(obj) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        try {
            if ($byteLength) {
                $byteLength(obj);
            } else {
                $abSlice(obj, 0);
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    : $ArrayBuffer
        ? function isArrayBuffer(obj) {
            return $toString(obj) === '[object ArrayBuffer]';
        }
        : function isArrayBuffer(obj) {
            return false;
        };
