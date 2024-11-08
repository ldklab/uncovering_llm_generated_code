// Node.js package for basic statistics, search, and transformation methods
const statsUtils = (() => {
  // Helper function to filter valid numeric values
  const filterValidNumbers = (iterable) => {
    return Array.from(iterable).filter(value => !isNaN(value) && value != null);
  };

  // Calculate minimum value
  const min = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? Math.min(...numbers) : undefined;
  };

  // Calculate maximum value
  const max = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? Math.max(...numbers) : undefined;
  };

  // Calculate sum of values
  const sum = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.reduce((acc, num) => acc + num, 0);
  };

  // Calculate mean value
  const mean = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? sum(numbers) / numbers.length : undefined;
  };

  // Calculate p-th quantile
  const quantile = (iterable, p) => {
    if (p < 0 || p > 1) {
      throw new RangeError("p must be between 0 and 1");
    }
    const numbers = filterValidNumbers(iterable).sort((a, b) => a - b);
    if (!numbers.length) return undefined;
    const position = (numbers.length - 1) * p;
    const lower = Math.floor(position);
    const upper = lower + 1;
    const weightedAverage = (numbers[lower] + (numbers[upper] ?? numbers[lower])) / 2;
    return weightedAverage;
  };

  // Return range of values
  const extent = (iterable) => [min(iterable), max(iterable)];

  // General filtering of elements
  const filter = (iterable, testFn) => Array.from(iterable).filter(testFn);

  // Transform elements with a mapper function
  const map = (iterable, mapFn) => Array.from(iterable).map(mapFn);

  // Exporting the methods as an object
  return {
    min,
    max,
    sum,
    mean,
    quantile,
    extent,
    filter,
    map
  };
})();

// Export the module for use in other files
module.exports = statsUtils;

// Example usage:
// const stats = require('./path/to/this/module');
// console.log(stats.mean([1, 2, 3, 4])); // Outputs: 2.5
// console.log(stats.extent([2, 3, -1, 5])); // Outputs: [-1, 5]
