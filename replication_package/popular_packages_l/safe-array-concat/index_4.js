// safe-array-concat.js
function safeConcat(...args) {
  const result = [];

  args.forEach(arg => {
    if (Array.isArray(arg)) {
      result.push(...arg);
    } else {
      result.push(arg);
    }
  });

  return result;
}

module.exports = safeConcat;

// test.js
const assert = require('assert');
const safeConcat = require('./safe-array-concat');

// Tests

// Normal `concat` spreads arrays, resulting in [1, 2, 3, [4]]
assert.deepEqual(
  [].concat([1, 2], 3, [[4]]),
  [1, 2, 3, [4]],
  'arrays spread as expected with normal concat'
);

// `safeConcat` should behave like normal `concat` for typical values
assert.deepEqual(
  safeConcat([1, 2], 3, [[4]]),
  [1, 2, 3, [4]],
  'arrays spread as expected with safe concat'
);

// String objects are spread when isConcatSpreadable is true using normal `concat`
String.prototype[Symbol.isConcatSpreadable] = true;
assert.deepEqual(
  [].concat('foo', Object('bar')),
  ['foo', 'b', 'a', 'r'],
  'spreadable String objects are spread with normal concat!!!'
);

// `safeConcat` does not spread non-array objects like strings
assert.deepEqual(
  safeConcat('foo', Object('bar')),
  ['foo', Object('bar')],
  'spreadable String objects are not spread with safe concat'
);

// Arrays are not spread using normal `concat` when isConcatSpreadable is false
Array.prototype[Symbol.isConcatSpreadable] = false;
assert.deepEqual(
  [].concat([1, 2], 3, [[4]]),
  [[], [1, 2], 3, [[4]]],
  'non-concat-spreadable arrays do not spread with normal concat!!!'
);

// `safeConcat` function always spreads arrays regardless of isConcatSpreadable
assert.deepEqual(
  safeConcat([1, 2], 3, [[4]]),
  [1, 2, 3, [4]],
  'non-concat-spreadable arrays still spread with safe concat'
);
