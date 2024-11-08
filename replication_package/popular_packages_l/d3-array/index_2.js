// Node.js package for basic statistics, search, and transformation
const d3Array = (() => {
  // Helper function to filter valid numbers from iterable
  const filterValidNumbers = (iterable) => Array.from(iterable).filter(value => typeof value === 'number' && !isNaN(value));

  // Calculate minimum value from iterable
  const min = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? Math.min(...numbers) : undefined;
  };
  
  // Calculate maximum value from iterable
  const max = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? Math.max(...numbers) : undefined;
  };
  
  // Calculate the sum of values from iterable
  const sum = (iterable) => {
    return filterValidNumbers(iterable).reduce((acc, num) => acc + num, 0);
  };
  
  // Calculate the mean of values from iterable
  const mean = (iterable) => {
    const numbers = filterValidNumbers(iterable);
    return numbers.length ? sum(numbers) / numbers.length : undefined;
  };
  
  // Calculate the p-th quantile from iterable
  const quantile = (iterable, p) => {
    if (p < 0 || p > 1) throw new RangeError("p must be between 0 and 1");
    const sorted = filterValidNumbers(iterable).sort((a, b) => a - b);
    if (!sorted.length) return undefined;
    const pos = (sorted.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base] + rest * ((sorted[base + 1] || sorted[base]) - sorted[base]);
  };
  
  // Return the min and max values as an array
  const extent = (iterable) => [min(iterable), max(iterable)];
  
  // Filter an iterable using a test function
  const filter = (iterable, test) => Array.from(iterable).filter(test);
  
  // Map iterable values using a mapper function
  const map = (iterable, mapper) => Array.from(iterable).map(mapper);
  
  return { min, max, sum, mean, quantile, extent, filter, map };
})();

module.exports = d3Array;
