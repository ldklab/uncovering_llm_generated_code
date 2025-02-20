// to-regex-range.js

function toRegexRange(min, max, options = {}) {
  // Validate input types
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected min and max to be numbers');
  }

  // Ensure min is less than max
  if (min > max) [min, max] = [max, min];

  // Destructure options with defaults
  const { capture, shorthand, relaxZeros = true } = options;
  // Compute zeroPadding behavior based on options
  const zeroPad = relaxZeros ? `{0,}` : `{}`;

  // Helper to create range segment in regex
  const rangeSegments = (range) => {
    return range.length === 1 ? `[${range[0]}]` : `[${range[0]}-${range[1]}]`;
  };

  // Construct regex pattern for given min and max
  const buildRange = (min, max) => {
    if (min === max) {
      return min.toString();
    }

    const lengthDiff = max.toString().length - min.toString().length;
    if (lengthDiff === 0) {
      return `[${min}-${max}]`;
    }

    return `${zeroPad}${min}-${max}`;
  };

  let source = '';

  // Add '-' prefix if including negative numbers
  if (min < 1) {
    source += '-?';
  }

  // Determine pattern based on shorthand option
  if (!shorthand) {
    source += buildRange(min, max);
  } else {
    source += `\\d{${min.toString().length},${max.toString().length}}`;
  }

  // Add capturing group if specified
  if (capture && source !== '' && source[0] !== '(') {
    source = `(${source})`;
  }

  return source;
}

module.exports = toRegexRange;
```

The `toRegexRange` function constructs a regular expression pattern string to match numbers within a specified range. It checks the input types and swaps `min` and `max` if they are in reverse. The options allow for conditional regex pattern adjustments, such as adding capture groups, using shorthand notation for digit length, and relaxing zero padding. The function builds different regex components based on these inputs and options and returns the final regex pattern string.