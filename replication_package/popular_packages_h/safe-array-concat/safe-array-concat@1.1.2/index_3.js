'use strict';

const GetIntrinsic = require('get-intrinsic');
const $concat = GetIntrinsic('%Array.prototype.concat%');

const callBind = require('call-bind');

const callBound = require('call-bind/callBound');
const $slice = callBound('Array.prototype.slice');

const hasSymbols = require('has-symbols/shams')();
const isConcatSpreadable = hasSymbols && Symbol.isConcatSpreadable;

const empty = [];
const $concatApply = isConcatSpreadable ? callBind.apply($concat, empty) : null;

const isArray = isConcatSpreadable ? require('isarray') : null;

module.exports = isConcatSpreadable
    ? function safeArrayConcat(...items) {
        const modifiedArgs = items.map(arg => {
            if (arg && typeof arg === 'object' && typeof arg[isConcatSpreadable] === 'boolean') {
                if (!empty[isConcatSpreadable]) {
                    empty[isConcatSpreadable] = true;
                }
                const arr = isArray(arg) ? $slice(arg) : [arg];
                arr[isConcatSpreadable] = true;
                return arr;
            }
            return arg;
        });
        return $concatApply(modifiedArgs);
    }
    : callBind($concat, empty);
