'use strict';

const toStr = Object.prototype.toString;
const fnToStr = Function.prototype.toString;
const isFnRegex = /^\s*(?:function)?\*/;
const hasToStringTag = require('has-tostringtag/shams')();
const getProto = Object.getPrototypeOf;

// Function to retrieve a generator function when possible
const getGeneratorFunc = () => {
  if (!hasToStringTag) {
    return false;
  }
  try {
    // Dynamically create and return a generator function
    return new Function('return function*() {}')();
  } catch (e) {
    // In case of an error, simply return false (since shams indicates no Symbol.toStringTag support)
    return false;
  }
};

let GeneratorFunction;

// Main function to check if a given function is a generator function
const isGeneratorFunction = (fn) => {
  if (typeof fn !== 'function') {
    return false;
  }

  // Check if the function syntax matches a generator function
  if (isFnRegex.test(fnToStr.call(fn))) {
    return true;
  }

  // If Symbol.toStringTag is not supported, use Object.prototype.toString
  if (!hasToStringTag) {
    const str = toStr.call(fn);
    return str === '[object GeneratorFunction]';
  }

  // If Object.getPrototypeOf is unavailable, result is false
  if (!getProto) {
    return false;
  }

  // Determine the prototype for a generator function if not already set
  if (typeof GeneratorFunction === 'undefined') {
    const generatorFunc = getGeneratorFunc();
    GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
  }

  // Compare the prototype of the provided function to the generator function prototype
  return getProto(fn) === GeneratorFunction;
};

module.exports = isGeneratorFunction;
