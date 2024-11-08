// File: lib/index.js
'use strict';

var origSymbol = typeof Symbol !== 'undefined' ? Symbol : null;

function hasNativeToStringTag() {
  return typeof origSymbol === 'function' && typeof origSymbol.toStringTag === 'symbol';
}

module.exports = hasNativeToStringTag;

// File: lib/shams.js
'use strict';

function hasSymbolToStringTagSham() {
  return (typeof Symbol === 'function' && typeof Symbol() === 'symbol') && !!Object.getOwnPropertySymbols;
}

module.exports = hasSymbolToStringTagSham;

// File: test/index.js
'use strict';

var test = require('tape');
var hasNativeToStringTag = require('../lib');
var hasSymbolToStringTagSham = require('../lib/shams');

test('hasNativeToStringTag', function(t) {
  t.equal(typeof hasNativeToStringTag, 'function', 'is a function');
  t.equal(typeof hasNativeToStringTag(), 'boolean', 'returns a boolean');
  t.end();
});

test('hasSymbolToStringTagSham', function(t) {
  t.equal(typeof hasSymbolToStringTagSham, 'function', 'is a function');
  t.equal(typeof hasSymbolToStringTagSham(), 'boolean', 'returns a boolean');
  t.end();
});

// File: index.js
'use strict';

var hasNativeToStringTag = require('./lib');
var hasSymbolToStringTagSham = require('./lib/shams');

module.exports = hasNativeToStringTag;
module.exports.shams = hasSymbolToStringTagSham;

// package.json
{
  "name": "has-tostringtag",
  "version": "1.0.0",
  "description": "Determine if the JS environment has Symbol.toStringTag support. Supports spec, or shams.",
  "main": "index.js",
  "scripts": {
    "test": "tape test/*.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/has-tostringtag.git"
  },
  "keywords": [
    "Symbol",
    "toStringTag",
    "polyfill",
    "sham"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "tape": "^5.3.1"
  }
}
