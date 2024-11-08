// is-arguments.js

'use strict';

module.exports = function isArguments(value) {
    // Verify if the provided value is an 'arguments' object
    return Object.prototype.toString.call(value) === '[object Arguments]';
};

// test.js

'use strict';

const isArguments = require('./is-arguments');
const assert = require('assert');

// Tests
assert.strictEqual(isArguments({}), false, 'Expected false for empty object');
assert.strictEqual(isArguments([]), false, 'Expected false for empty array');

(function () {
    assert.strictEqual(isArguments(arguments), true, 'Expected true for arguments object');
}());

// Run tests only when this file is executed directly
if (require.main === module) {
    console.log('All tests passed.');
}
