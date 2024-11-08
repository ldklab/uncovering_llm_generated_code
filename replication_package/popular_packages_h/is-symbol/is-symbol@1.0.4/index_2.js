'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

const isSymbol = hasSymbols ? (value) => {
  if (typeof value === 'symbol') {
    return true;
  }
  
  if (toStr.call(value) !== '[object Symbol]') {
    return false;
  }

  const symToStr = Symbol.prototype.toString;
  const symStringRegex = /^Symbol\(.*\)$/;
  
  const isRealSymbolObject = (val) => {
    try {
      return typeof val.valueOf() === 'symbol' && symStringRegex.test(symToStr.call(val));
    } catch (e) {
      return false;
    }
  };
  
  return isRealSymbolObject(value);
} : (value) => false;

module.exports = isSymbol;
