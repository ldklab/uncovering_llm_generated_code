// index.js
function whichCollection(value) {
  const collectionTypes = {
    '[object Map]': 'Map',
    '[object Set]': 'Set',
    '[object WeakMap]': 'WeakMap',
    '[object WeakSet]': 'WeakSet',
  };

  return collectionTypes[Object.prototype.toString.call(value)] || false;
}

module.exports = whichCollection;

// test.js
const whichCollection = require('./index');
const assert = require('assert');

const testCases = [
  { input: undefined, expected: false },
  { input: null, expected: false },
  { input: false, expected: false },
  { input: true, expected: false },
  { input: [], expected: false },
  { input: {}, expected: false },
  { input: /a/g, expected: false },
  { input: new RegExp('a', 'g'), expected: false },
  { input: new Date(), expected: false },
  { input: 42, expected: false },
  { input: NaN, expected: false },
  { input: Infinity, expected: false },
  { input: new Number(42), expected: false },
  { input: 42n, expected: false },
  { input: Object(42n), expected: false },
  { input: 'foo', expected: false },
  { input: Object('foo'), expected: false },
  { input: function () {}, expected: false },
  { input: function* () {}, expected: false },
  { input: x => x * x, expected: false },
  { input: [], expected: false },
  { input: new Map(), expected: 'Map' },
  { input: new Set(), expected: 'Set' },
  { input: new WeakMap(), expected: 'WeakMap' },
  { input: new WeakSet(), expected: 'WeakSet' },
];

testCases.forEach(testCase => {
  const actual = whichCollection(testCase.input);
  assert.equal(actual, testCase.expected, `Test failed for input: ${testCase.input}`);
});

console.log('All tests passed.');

// package.json
{
  "name": "which-collection",
  "version": "1.0.0",
  "description": "Identify whether a value is one of the JavaScript collection types: Map, Set, WeakMap, or WeakSet.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "Your Name",
  "license": "MIT"
}
