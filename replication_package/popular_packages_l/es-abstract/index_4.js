const { isCallable } = require('es-abstract');
const assert = require('assert');

// Check if a regular function is callable
assert(isCallable(() => {})); // should return true as arrow functions are callable

// Check if a regular expression is callable
assert(!isCallable(/a/g)); // should return false as regexp objects are not callable
