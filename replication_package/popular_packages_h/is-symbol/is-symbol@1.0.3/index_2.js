'use strict';

const toStr = Object.prototype.toString;
const hasSymbols = require('has-symbols')();

const isSymbolValue = (value) => typeof value === 'symbol';

const isSymbolObject = (value) => {
  const symToStr = Symbol.prototype.toString;
  const symStringRegex = /^Symbol\(.*\)$/;
  try {
    return toStr.call(value) === '[object Symbol]' && symStringRegex.test(symToStr.call(value));
  } catch {
    return false;
  }
};

const isSymbol = (value) => {
  if (!hasSymbols) return false;
  return isSymbolValue(value) || isSymbolObject(value);
};

module.exports = isSymbol;
