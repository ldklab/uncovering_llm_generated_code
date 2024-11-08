const ES = require('es-abstract');
const assert = require('assert');

// Check if an anonymous function is callable
const isFunctionCallable = ES.isCallable(function () {});
assert(isFunctionCallable); // Should return true

// Check if a regular expression is callable
const isRegExCallable = ES.isCallable(/a/g);
assert(!isRegExCallable); // Should return false
