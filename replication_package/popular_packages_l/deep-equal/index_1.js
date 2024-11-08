const deepEqual = require('deep-equal'); // Import the deep-equal library

// Perform deep comparisons between two sets of objects
const results = [
    deepEqual({ a: [2, 3], b: [4] }, { a: [2, 3], b: [4] }), // Expect true: both objects are identical
    deepEqual({ x: 5, y: [6] }, { x: 5, y: 6 }) // Expect false: different structures for y
];

// Output the comparison results to the console
console.log(results);
