const ES = require('es-abstract');
const assert = require('assert');

// Check if a function is callable
const functionIsCallable = ES.isCallable(() => {});
assert(functionIsCallable); // Expect true

// Check if a regular expression is callable
const regexIsCallable = ES.isCallable(/a/g);
assert(!regexIsCallable); // Expect false
