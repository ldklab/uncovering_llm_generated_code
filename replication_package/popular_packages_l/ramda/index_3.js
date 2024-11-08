// Implementation of basic functions similar to Ramda library

const R = (() => {
  // Curried function to enable partial application
  const curry = (fn) => {
    return function curried(...args) {
      if (args.length >= fn.length) {
        return fn.apply(this, args);
      } else {
        return curried.bind(this, ...args);
      }
    };
  };

  // Function to apply a provided function to each element in an array
  const map = curry((func, array) => {
    return array.map(func);
  });

  // Returns its argument as it is
  const identity = (value) => value;

  // Demonstration of map and identity function usage
  const example = () => {
    const numbers = [1, 2, 3];
    console.log(map(identity, numbers)); // Outputs: [1, 2, 3]
  };

  // Exposing functions to the outside
  return {
    curry,
    map,
    identity,
    example
  };
})();

// Execute example use case
R.example();
