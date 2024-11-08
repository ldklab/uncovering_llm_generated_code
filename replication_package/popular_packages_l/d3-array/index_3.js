// Implementing Node.js package for basic statistics, search, and transformation methods
const d3Array = (() => {
  const filterValidNumbers = (iterable) => Array.from(iterable).filter(d => !isNaN(d) && d != null);

  const min = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length === 0 ? undefined : Math.min(...numbers);
  };

  const max = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length === 0 ? undefined : Math.max(...numbers);
  };

  const sum = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.reduce((acc, val) => acc + val, 0);
  };

  const mean = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length === 0 ? undefined : sum(numbers) / numbers.length;
  };

  const quantile = (iterable, p) => {
    if (p < 0 || p > 1) throw new RangeError("p must be in range [0, 1]");
    const sorted = filterValidNumbers(iterable).sort((a, b) => a - b);
    if (sorted.length === 0) return undefined;
    const pos = (sorted.length - 1) * p;
    const lower = Math.floor(pos);
    const upper = lower + 1;
    return (sorted[lower] + (sorted[upper] || sorted[lower])) / 2;
  };

  const extent = (iterable) => [min(iterable), max(iterable)];

  const filter = (iterable, test) => Array.from(iterable).filter(test);

  const map = (iterable, mapper) => Array.from(iterable).map(mapper);

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

module.exports = d3Array;

// Example usage
// const arrayOps = require('d3-array');
// console.log(arrayOps.mean([1, 2, 3, 4])); // Outputs: 2.5
// console.log(arrayOps.extent([2, 3, -1, 5])); // Outputs: [-1, 5]
