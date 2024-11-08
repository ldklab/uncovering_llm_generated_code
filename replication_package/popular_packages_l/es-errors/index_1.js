// File: index.js
// Exports the built-in JavaScript Error constructor
module.exports = Error;

// File: eval.js
// Exports the built-in JavaScript EvalError constructor
module.exports = EvalError;

// File: range.js
// Exports the built-in JavaScript RangeError constructor
module.exports = RangeError;

// File: ref.js
// Exports the built-in JavaScript ReferenceError constructor
module.exports = ReferenceError;

// File: syntax.js
// Exports the built-in JavaScript SyntaxError constructor
module.exports = SyntaxError;

// File: type.js
// Exports the built-in JavaScript TypeError constructor
module.exports = TypeError;

// File: uri.js
// Exports the built-in JavaScript URIError constructor
module.exports = URIError;

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
// Importing assertion library for test cases
const assert = require('assert');

// Importing all JavaScript error constructors exported from respective files
const Base = require('./index');
const Eval = require('./eval');
const Range = require('./range');
const Ref = require('./ref');
const Syntax = require('./syntax');
const Type = require('./type');
const URI = require('./uri');

// Performing assertions to confirm correct module exports
assert.equal(Base, Error);
assert.equal(Eval, EvalError);
assert.equal(Range, RangeError);
assert.equal(Ref, ReferenceError);
assert.equal(Syntax, SyntaxError);
assert.equal(Type, TypeError);
assert.equal(URI, URIError);

// Output message if all test cases pass
console.log('All tests passed!');
