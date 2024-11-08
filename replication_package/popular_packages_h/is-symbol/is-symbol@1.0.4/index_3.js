'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

const isSymbol = hasSymbols
  ? function (value) {
      if (typeof value === 'symbol') {
        return true;
      }
      if (toStr.call(value) !== '[object Symbol]') {
        return false;
      }
      try {
        return typeof value.valueOf() === 'symbol' && /^Symbol\(.*\)$/.test(Symbol.prototype.toString.call(value));
      } catch (e) {
        return false;
      }
    }
  : function () {
      // In environments without symbol support
      return false;
    };

module.exports = isSymbol;
