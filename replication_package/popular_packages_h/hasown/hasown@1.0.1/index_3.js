'use strict';

const { hasOwnProperty } = Object.prototype;

const curry = (fn, n = fn.length) => {
  const getCurryClosure = (prevArgs = []) => (...args) => {
    const allArgs = [...prevArgs, ...args];
    return allArgs.length < n ? getCurryClosure(allArgs) : fn(...allArgs);
  };
  return getCurryClosure();
};

module.exports = curry((object, property) => hasOwnProperty.call(object, property));
