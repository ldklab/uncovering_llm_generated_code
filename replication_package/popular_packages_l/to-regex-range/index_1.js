// to-regex-range.js

function toRegexRange(min, max, options = {}) {
  // Validate input: ensure min and max are numbers
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected min and max to be numbers');
  }

  // Swap if min is greater than max to ensure the correct order
  if (min > max) [min, max] = [max, min];

  // Destructure options object, setting default values if not provided
  const { capture, shorthand, relaxZeros = true } = options;
  // Determine the pattern for zero padding based on relaxZeros option
  const zeroPad = relaxZeros ? '{0,}' : '{}';

  // Helper function to create a regex character class for a range of digits
  const rangeSegments = (range) => {
    return range.length === 1 ? `[${range[0]}]` : `[${range[0]}-${range[1]}]`;
  };

  // Constructs regex for the numeric range
  const buildRange = (min, max) => {
    if (min === max) {
      return min.toString();
    }
    // Determines if min and max have the same number of digits
    const lengthDiff = max.toString().length - min.toString().length;
    if (lengthDiff === 0) {
      return `[${min}-${max}]`;
    }
    return `${zeroPad}${min}-${max}`;
  };

  let source = '';
  // Check for numbers that might include negative sign
  if (min < 1) {
    source += '-?';
  }
  // Create regex pattern based on options and range
  if (!shorthand) {
    source += buildRange(min, max);
  } else {
    source += `\\d{${min.toString().length},${max.toString().length}}`;
  }

  // Wrap source with parentheses if capture option is true
  if (capture && source !== '' && source[0] !== '(') {
    source = `(${source})`;
  }

  // Return the final regex pattern as a string
  return source;
}

module.exports = toRegexRange;
```
