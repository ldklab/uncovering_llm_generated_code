  const equal = require('deep-equal');
  console.dir([
      equal({ a: [2, 3], b: [4] }, { a: [2, 3], b: [4] }), // true
      equal({ x: 5, y: [6] }, { x: 5, y: 6 }) // false
  ]);
  