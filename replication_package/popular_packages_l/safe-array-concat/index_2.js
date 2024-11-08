// safe-array-concat.js
function safeConcat(...args) {
  const result = [];
  // Iterate over each argument passed to the function
  args.forEach(arg => {
    // Check if the argument is an array
    if (Array.isArray(arg)) {
      // If true, spread its elements into the result array
      result.push(...arg);
    } else {
      // If false, push the argument itself into the result array
      result.push(arg);
    }
  });
  // Return the concatenated result array
  return result;
}

module.exports = safeConcat;

// test.js
const assert = require('assert');
const safeConcat = require('./safe-array-concat');

// Tests to compare the behavior of default concat and safeConcat
// Normal concat spreads array elements but treats objects as single elements
assert.deepEqual([].concat([1, 2], 3, [[4]]), [1, 2, 3, [4]], 'arrays spread as expected with normal concat');
assert.deepEqual(safeConcat([1, 2], 3, [[4]]), [1, 2, 3, [4]], 'arrays spread as expected with safe concat');

// Altering String prototype for testing spread behavior
String.prototype[Symbol.isConcatSpreadable] = true;
// Test: Concat spreads individual characters of "bar" due to spreadability
assert.deepEqual([].concat('foo', Object('bar')), ['foo', 'b', 'a', 'r'], 'spreadable String objects are spread with normal concat!!!');
// Test: safeConcat does not spread characters of "bar"
assert.deepEqual(safeConcat('foo', Object('bar')), ['foo', Object('bar')], 'spreadable String objects are not spread with safe concat');

// Altering Array prototype to prevent spread in default concat
Array.prototype[Symbol.isConcatSpreadable] = false;
// Test: Concat treats arrays as non-spreadable
assert.deepEqual([].concat([1, 2], 3, [[4]]), [[], [1, 2], 3, [[4]]], 'non-concat-spreadable arrays do not spread with normal concat!!!');
// Test: safeConcat still spreads arrays even if set to non-spreadable
assert.deepEqual(safeConcat([1, 2], 3, [[4]]), [1, 2, 3, [4]], 'non-concat-spreadable arrays still spread with safe concat');
