// index.js
'use strict';

// Exporting the native JavaScript Object
module.exports = Object;

// ToObject.js
'use strict';

// Function to convert a value to an Object.
// Throws a TypeError if the value is null or undefined.
module.exports = function ToObject(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  return Object(value);
};

// RequireObjectCoercible.js
'use strict';

// Function to ensure a value is coercible to an object, 
// meaning it must not be null or undefined. Throws a TypeError otherwise.
module.exports = function RequireObjectCoercible(value) {
  if (value === null || value === undefined) {
    throw new TypeError('Cannot perform operation on undefined or null');
  }
  return value;
};

// test.js
'use strict';

// Import the required modules
const assert = require('assert');
const $Object = require('./index.js');
const ToObject = require('./ToObject');
const RequireObjectCoercible = require('./RequireObjectCoercible');

// Tests to validate functionality

// Check if $Object is the native Object
assert.equal($Object, Object);

// Ensure ToObject throws a TypeError for null and undefined
assert.throws(() => ToObject(null), TypeError);
assert.throws(() => ToObject(undefined), TypeError);

// Ensure RequireObjectCoercible throws a TypeError for null and undefined
assert.throws(() => RequireObjectCoercible(null), TypeError);
assert.throws(() => RequireObjectCoercible(undefined), TypeError);

// Verify the function behavior with valid inputs
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
