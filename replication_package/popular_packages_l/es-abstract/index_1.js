const ES = require('es-abstract');
const assert = require('assert');

// Assert that a function is callable
assert(ES.isCallable(() => {})); // should pass (true)

// Assert that a regular expression is not callable
assert(!ES.isCallable(new RegExp('a', 'g'))); // should pass (false)
