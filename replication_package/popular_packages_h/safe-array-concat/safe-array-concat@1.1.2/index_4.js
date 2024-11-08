'use strict';

const GetIntrinsic = require('get-intrinsic');
const $concat = GetIntrinsic('%Array.prototype.concat%');

const callBind = require('call-bind');
const callBound = require('call-bind/callBound');
const $slice = callBound('Array.prototype.slice');

const hasSymbols = require('has-symbols/shams')();
const isConcatSpreadable = hasSymbols && Symbol.isConcatSpreadable;

// Empty array used for calling concat
const empty = [];
const $concatApply = isConcatSpreadable ? callBind.apply($concat, empty) : null;

// Function to check if value is an array
const isArray = isConcatSpreadable ? require('isarray') : null;

// Module exports
module.exports = isConcatSpreadable
  ? function safeArrayConcat() {
      for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (arg && typeof arg === 'object' && typeof arg[isConcatSpreadable] === 'boolean') {
          if (!empty[isConcatSpreadable]) {
            empty[isConcatSpreadable] = true;
          }
          // Use slice if arg is array, otherwise wrap in array
          let arr = isArray(arg) ? $slice(arg) : [arg];
          arr[isConcatSpreadable] = true; // Enable spreadability
          arguments[i] = arr;
        }
      }
      // Concatenate all arguments
      return $concatApply(arguments);
    }
  : callBind($concat, empty);
