// File: index.js
module.exports = Error;

// File: eval.js
module.exports = EvalError;

// File: range.js
module.exports = RangeError;

// File: ref.js
module.exports = ReferenceError;

// File: syntax.js
module.exports = SyntaxError;

// File: type.js
module.exports = TypeError;

// File: uri.js
module.exports = URIError;

// File: package.json
{
  "name": "es-errors",
  "version": "1.0.0",
  "description": "A simple export for a few of the JS Error constructors.",
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

const Base = require('./index');
const Eval = require('./eval');
const Range = require('./range');
const Ref = require('./ref');
const Syntax = require('./syntax');
const Type = require('./type');
const URI = require('./uri');

assert.strictEqual(Base, Error);
assert.strictEqual(Eval, EvalError);
assert.strictEqual(Range, RangeError);
assert.strictEqual(Ref, ReferenceError);
assert.strictEqual(Syntax, SyntaxError);
assert.strictEqual(Type, TypeError);
assert.strictEqual(URI, URIError);

console.log('All tests passed!');
