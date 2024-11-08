markdown
// is-arguments.js

'use strict';

module.exports = function isArguments(value) {
    // Check for typical arguments length and presence
    return Object.prototype.toString.call(value) === '[object Arguments]';
};

// test.js

'use strict';

var isArguments = require('./is-arguments');
var assert = require('assert');

// Test cases
assert.equal(isArguments({}), false, 'Expected false for empty object');
assert.equal(isArguments([]), false, 'Expected false for empty array');
(function () {
	assert.equal(isArguments(arguments), true, 'Expected true for arguments object');
}());

// Instructions for running tests
if (require.main === module) {
    console.log('All tests passed.');
}
