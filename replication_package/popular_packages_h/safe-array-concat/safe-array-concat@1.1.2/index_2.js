'use strict';

const GetIntrinsic = require('get-intrinsic');
const $concat = GetIntrinsic('%Array.prototype.concat%');

const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const $slice = callBound('Array.prototype.slice');

const hasSymbols = require('has-symbols/shams')();
const isConcatSpreadable = hasSymbols && Symbol.isConcatSpreadable;

const emptyArr = [];
const $concatApply = isConcatSpreadable ? callBind.apply($concat, emptyArr) : null;

const isArray = isConcatSpreadable ? require('isarray') : null;

function safeArrayConcat(...args) {
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg && typeof arg === 'object' && typeof arg[isConcatSpreadable] === 'boolean') {
            if (!emptyArr[isConcatSpreadable]) {
                emptyArr[isConcatSpreadable] = true;
            }
            const arr = isArray(arg) ? $slice(arg) : [arg];
            arr[isConcatSpreadable] = true;
            args[i] = arr;
        }
    }
    return $concatApply(args);
}

module.exports = isConcatSpreadable ? safeArrayConcat : callBind($concat, emptyArr);
