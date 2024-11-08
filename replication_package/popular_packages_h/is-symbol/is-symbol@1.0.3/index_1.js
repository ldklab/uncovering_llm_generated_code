'use strict';

const toStr = Object.prototype.toString;
const hasSymbolsSupport = require('has-symbols')();

const isSymbol = hasSymbolsSupport
  ? (value) => {
      if (typeof value === 'symbol') {
        return true;
      }
      if (toStr.call(value) !== '[object Symbol]') {
        return false;
      }
      try {
        const symToStr = Symbol.prototype.toString;
        const isRealSymbolObject = (symValue) => {
          const symStringRegex = /^Symbol\(.*\)$/;
          return typeof symValue.valueOf() === 'symbol' && 
                 symStringRegex.test(symToStr.call(symValue));
        };
        return isRealSymbolObject(value);
      } catch {
        return false;
      }
    }
  : () => false;

module.exports = isSymbol;
