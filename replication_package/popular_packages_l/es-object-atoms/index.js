markdown
// es-object-atoms/index.js
'use strict';

module.exports = Object;

// es-object-atoms/ToObject.js
'use strict';

module.exports = function ToObject(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  return Object(value);
};

// es-object-atoms/RequireObjectCoercible.js
'use strict';

module.exports = function RequireObjectCoercible(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot perform operation on undefined or null');
  }
  return value;
};

// test/test.js
'use strict';

const assert = require('assert');
const $Object = require('../es-object-atoms');
const ToObject = require('../es-object-atoms/ToObject');
const RequireObjectCoercible = require('../es-object-atoms/RequireObjectCoercible');

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
    "test": "node test/test.js"
  }
}
