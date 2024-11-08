// es-shim-unscopables.js
function shimUnscopables(methodName) {
    if (typeof methodName !== 'string') {
        throw new TypeError('Method name must be a string');
    }
    if (!Array.prototype.hasOwnProperty(methodName)) {
        throw new Error(`Array prototype does not have a method named "${methodName}"`);
    }
    
    // Access the existing unscopables or initiate an empty object if it doesn’t exist
    const unscopables = Array.prototype[Symbol.unscopables] || {};
    
    // Mark the method as unscopable
    unscopables[methodName] = true;
    
    // Assign updated unscopables back to Array.prototype
    Array.prototype[Symbol.unscopables] = unscopables;
}

module.exports = shimUnscopables;

// test.js
const assert = require('assert');
const shimUnscopables = require('./es-shim-unscopables');

let copyWithin;
let concat;

with ([]) {
    assert.strictEqual(concat, Array.prototype.concat);
    assert.notStrictEqual(copyWithin, Array.prototype.copyWithin);
}

shimUnscopables('concat');

with ([]) {
    assert.notStrictEqual(concat, Array.prototype.concat);
    assert.notStrictEqual(copyWithin, Array.prototype.copyWithin);
}

// package.json
{
  "name": "es-shim-unscopables",
  "version": "1.0.0",
  "description": "Helper package to shim a method into Array.prototype[Symbol.unscopables]",
  "main": "es-shim-unscopables.js",
  "scripts": {
    "test": "node test"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^1.5.0"
  }
}
