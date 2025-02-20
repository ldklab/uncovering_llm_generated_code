// index.js
'use strict';

module.exports = Object;

// ToObject.js
'use strict';

function ToObject(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  return Object(value);
}

module.exports = ToObject;

// RequireObjectCoercible.js
'use strict';

function RequireObjectCoercible(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot perform operation on undefined or null');
  }
  return value;
}

module.exports = RequireObjectCoercible;

// test.js
'use strict';

const assert = require('assert');
const $Object = require('./index');
const ToObject = require('./ToObject');
const RequireObjectCoercible = require('./RequireObjectCoercible');

assert.equal($Object, Object);
assert.throws(() => ToObject(null), TypeError);
assert.throws(() => ToObject(undefined), TypeError);
assert.throws(() => RequireObjectCoercible(null), TypeError);
assert.throws(() => RequireObjectCoercible(undefined), TypeError);

assert.deepEqual(RequireObjectCoercible(true), true);
assert.deepEqual(ToObject(true), Object(true));

const obj = {};
assert.equal(RequireObjectCoercible(obj), obj);
assert.equal(ToObject(obj), obj);

console.log('All tests passed!');

// package.json
{
  "name": "es-object-atoms",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  }
}
