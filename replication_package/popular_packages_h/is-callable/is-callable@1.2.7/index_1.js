'use strict';

const fnToStr = Function.prototype.toString;
let reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
let isCallableMarker;

if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
  try {
    const badArrayLike = Object.defineProperty({}, 'length', {
      get: function () {
        throw isCallableMarker;
      }
    });
    isCallableMarker = {};
    reflectApply(function () { throw 42; }, null, badArrayLike);
  } catch (e) {
    if (e !== isCallableMarker) {
      reflectApply = null;
    }
  }
} else {
  reflectApply = null;
}

const constructorRegex = /^\s*class\b/;
const isES6ClassFn = function (value) {
  try {
    const fnStr = fnToStr.call(value);
    return constructorRegex.test(fnStr);
  } catch (e) {
    return false;
  }
};

const tryFunctionObject = function (value) {
  try {
    if (isES6ClassFn(value)) { return false; }
    fnToStr.call(value);
    return true;
  } catch (e) {
    return false;
  }
};

const toStr = Object.prototype.toString;
const objectClass = '[object Object]';
const fnClass = '[object Function]';
const genClass = '[object GeneratorFunction]';
const ddaClasses = [
  '[object HTMLAllCollection]',
  '[object HTML document.all class]',
  '[object HTMLCollection]'
];

const hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag;
const isIE68 = !(0 in [,]);

let isDDA = function () { return false; };
if (typeof document === 'object') {
  const all = document.all;
  if (toStr.call(all) === toStr.call(document.all)) {
    isDDA = function (value) {
      if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
        try {
          const str = toStr.call(value);
          return (ddaClasses.includes(str) || str === objectClass) && value('') == null;
        } catch (e) { /**/ }
      }
      return false;
    };
  }
}

module.exports = reflectApply
  ? function isCallable(value) {
      if (isDDA(value)) { return true; }
      if (!value) { return false; }
      if (typeof value !== 'function' && typeof value !== 'object') { return false; }
      try {
        reflectApply(value, null, {});
      } catch (e) {
        if (e !== isCallableMarker) { return false; }
      }
      return !isES6ClassFn(value) && tryFunctionObject(value);
    }
  : function isCallable(value) {
      if (isDDA(value)) { return true; }
      if (!value) { return false; }
      if (typeof value !== 'function' && typeof value !== 'object') { return false; }
      if (hasToStringTag) { return tryFunctionObject(value); }
      if (isES6ClassFn(value)) { return false; }
      const strClass = toStr.call(value);
      if (![fnClass, genClass].includes(strClass) && !(/^\[object HTML/).test(strClass)) { return false; }
      return tryFunctionObject(value);
    };
