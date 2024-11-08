// is-arguments.js

'use strict';

module.exports = function isArguments(value) {
    // Use Object prototype method to check for arguments object
    return Object.prototype.toString.call(value) === '[object Arguments]';
};

// test.js

'use strict';

const isArguments = require('./is-arguments');
const assert = require('assert');

// Define test cases for the isArguments function
assert.strictEqual(isArguments({}), false, 'Expected false for empty object');
assert.strictEqual(isArguments([]), false, 'Expected false for empty array');
(function () {
    assert.strictEqual(isArguments(arguments), true, 'Expected true for arguments object');
}());

// Run tests and report results when executed directly
if (require.main === module) {
    console.log('All tests passed.');
}
