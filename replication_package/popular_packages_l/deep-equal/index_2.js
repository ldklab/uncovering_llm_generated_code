const deepEqual = require('deep-equal');

const objectsToCompare = [
    [{ a: [2, 3], b: [4] }, { a: [2, 3], b: [4] }],
    [{ x: 5, y: [6] }, { x: 5, y: 6 }]
];

const comparisonResults = objectsToCompare.map(([obj1, obj2]) => deepEqual(obj1, obj2));

console.dir(comparisonResults);
