// to-regex-range.js

function toRegexRange(min, max, options = {}) {
  // Ensure min and max are numerical values
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected min and max to be numbers');
  }
  
  // Swap min and max if min is greater than max
  if (min > max) [min, max] = [max, min];

  // Destructure options with default value for relaxZeros
  const { capture, shorthand, relaxZeros = true } = options;

  // Zero padding based on relaxZeros option
  const zeroPad = relaxZeros ? `{0,}` : `{}`;

  // Helper function for character range segment
  const rangeSegments = (range) => {
    return range.length === 1 ? `[${range[0]}]` : `[${range[0]}-${range[1]}]`;
  };

  // Construct the regex pattern for the specified range
  const buildRange = (min, max) => {
    if (min === max) return min.toString();

    const lengthDiff = max.toString().length - min.toString().length;
    return lengthDiff === 0
      ? `[${min}-${max}]`
      : `${zeroPad}${min}-${max}`;
  };

  let source = '';

  // Prefix negative sign matching if min < 1
  if (min < 1) {
    source += '-?';
  }

  // Append built range or shorthand pattern based on shorthand option
  source += !shorthand
    ? buildRange(min, max)
    : `\\d{${min.toString().length},${max.toString().length}}`;

  // Capture the pattern if capture option is true
  if (capture && source !== '' && source[0] !== '(') {
    source = `(${source})`;
  }

  // Return the final regex string pattern
  return source;
}

module.exports = toRegexRange;
```

This JavaScript function `toRegexRange` is designed to generate a regular expression string that matches a range of numbers specified by the `min` and `max` parameters. It allows customization through the `options` parameter, which can include capturing groups, shorthand for defining number lengths, and zero relaxation. The function ensures valid numerical inputs and appropriately constructs the regex with optional zero padding, capturing, and shorthand depending on the options, while also handling potential negative ranges. Finally, it exports the function as a module.