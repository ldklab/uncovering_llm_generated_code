const deepEqual = require('deep-equal');

const results = [
  deepEqual({ a: [2, 3], b: [4] }, { a: [2, 3], b: [4] }), // true
  deepEqual({ x: 5, y: [6] }, { x: 5, y: 6 }) // false
];

console.dir(results);
