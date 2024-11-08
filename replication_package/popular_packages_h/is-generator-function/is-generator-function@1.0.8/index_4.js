'use strict';

const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
const getProto = Object.getPrototypeOf;

const getGeneratorFunc = () => {
  if (!hasToStringTag) {
    return false;
  }
  try {
    return Function('return function*() {}')();
  } catch (e) {
    return false;
  }
};

const generatorFunc = getGeneratorFunc();
const GeneratorFunction = getProto && generatorFunc ? getProto(generatorFunc) : false;

function isGeneratorFunction(fn) {
  if (typeof fn !== 'function') {
    return false;
  }
  if (isFnRegex.test(fnToStr.call(fn))) {
    return true;
  }
  if (!hasToStringTag) {
    return toStr.call(fn) === '[object GeneratorFunction]';
  }
  return getProto && getProto(fn) === GeneratorFunction;
}

module.exports = isGeneratorFunction;
