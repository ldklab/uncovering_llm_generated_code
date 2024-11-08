markdown
// File: index.js
exports.Error = Error;

// File: eval.js
exports.EvalError = EvalError;

// File: range.js
exports.RangeError = RangeError;

// File: ref.js
exports.ReferenceError = ReferenceError;

// File: syntax.js
exports.SyntaxError = SyntaxError;

// File: type.js
exports.TypeError = TypeError;

// File: uri.js
exports.URIError = URIError;

// File: package.json
{
  "name": "es-errors",
  "version": "1.0.0",
  "description": "A simple cache for a few of the JS Error constructors.",
  "main": "index.js",
  "files": [
    "index.js",
    "eval.js",
    "range.js",
    "ref.js",
    "syntax.js",
    "type.js",
    "uri.js"
  ],
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}

// File: test.js
const assert = require('assert');

const Base = require('./index').Error;
const Eval = require('./eval').EvalError;
const Range = require('./range').RangeError;
const Ref = require('./ref').ReferenceError;
const Syntax = require('./syntax').SyntaxError;
const Type = require('./type').TypeError;
const URI = require('./uri').URIError;

assert.equal(Base, Error);
assert.equal(Eval, EvalError);
assert.equal(Range, RangeError);
assert.equal(Ref, ReferenceError);
assert.equal(Syntax, SyntaxError);
assert.equal(Type, TypeError);
assert.equal(URI, URIError);

console.log('All tests passed!');
