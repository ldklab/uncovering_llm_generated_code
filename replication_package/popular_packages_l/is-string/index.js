// is-string/index.js

'use strict';

function isString(value) {
  return Object.prototype.toString.call(value) === '[object String]' || typeof value === 'string';
}

module.exports = isString;

// is-string/test/test.js

'use strict';

var assert = require('assert');
var isString = require('../index');

assert.notOk(isString(undefined));
assert.notOk(isString(null));
assert.notOk(isString(false));
assert.notOk(isString(true));
assert.notOk(isString(function() {}));
assert.notOk(isString([]));
assert.notOk(isString({}));
assert.notOk(isString(/a/g));
assert.notOk(isString(new RegExp('a', 'g')));
assert.notOk(isString(new Date()));
assert.notOk(isString(42));
assert.notOk(isString(NaN));
assert.notOk(isString(Infinity));
assert.notOk(isString(new Number(42)));

assert.ok(isString('foo'));
assert.ok(isString(Object('foo')));

console.log('All tests passed!');

// To run the tests, you can use a simple script or a testing framework like Mocha:
if (require.main === module) {
  console.log('Running tests...');
  require('./test');
}

// is-string/package.json

{
  "name": "is-string",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "devDependencies": {
  },
  "dependencies": {
  },
  "author": "",
  "license": "ISC"
}
