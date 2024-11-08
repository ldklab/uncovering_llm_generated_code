// Node.js package for basic statistics, search, and transformations
const d3Array = (() => {
  // Helper to filter valid numbers
  const filterValidNumbers = (iterable) => Array.from(iterable).filter(d => !isNaN(d) && d != null);

  // Statistics Functions
  const statistics = {
    min(iterable) {
      const validNumbers = filterValidNumbers(iterable);
      return validNumbers.length ? Math.min(...validNumbers) : undefined;
    },
    max(iterable) {
      const validNumbers = filterValidNumbers(iterable);
      return validNumbers.length ? Math.max(...validNumbers) : undefined;
    },
    sum(iterable) {
      return filterValidNumbers(iterable).reduce((acc, num) => acc + num, 0);
    },
    mean(iterable) {
      const validNumbers = filterValidNumbers(iterable);
      return validNumbers.length ? statistics.sum(validNumbers) / validNumbers.length : undefined;
    },
    quantile(iterable, p) {
      if (p < 0 || p > 1) throw new RangeError("p must be within [0, 1]");
      const sorted = filterValidNumbers(iterable).sort((a, b) => a - b);
      if (!sorted.length) return undefined;
      const pos = (sorted.length - 1) * p;
      return (sorted[Math.floor(pos)] + (sorted[Math.ceil(pos)] || sorted[Math.floor(pos)])) / 2;
    },
    extent(iterable) {
      return [statistics.min(iterable), statistics.max(iterable)];
    }
  };

  // Transformation Methods
  const transformations = {
    filter(iterable, test) {
      return Array.from(iterable).filter(test);
    },
    map(iterable, mapper) {
      return Array.from(iterable).map(mapper);
    }
  };

  return {
    ...statistics,
    ...transformations
  };
})();

module.exports = d3Array;

// Example usage
// const arrayOps = require('d3-array');
// console.log(arrayOps.mean([1, 2, 3, 4])); // Outputs: 2.5
// console.log(arrayOps.extent([2, 3, -1, 5])); // Outputs: [-1, 5]
