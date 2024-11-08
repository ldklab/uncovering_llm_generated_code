// to-regex-range.js

function toRegexRange(min, max, options = {}) {
  // Validate input types
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected min and max to be numbers');
  }

  // Ensure min is less than or equal to max
  if (min > max) [min, max] = [max, min];

  // Destructure options or use defaults
  const { capture, shorthand, relaxZeros = true } = options;
  // Set zero padding option based on relaxZeros
  const zeroPad = relaxZeros ? `{0,}` : `{}`;

  // Helper function to create range segments
  const rangeSegments = (range) => {
    if (range.length === 1) {
      return `[${range[0]}]`;
    }
    return `[${range[0]}-${range[1]}]`;
  };

  // Create range expression between min and max
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

  // Handle optional negative sign for numbers less than 1
  if (min < 1) {
    source += '-?';
  }

  // Construct the regex pattern based on whether shorthand is used
  if (!shorthand) {
    source += buildRange(min, max);
  } else {
    source += `\\d{${min.toString().length},${max.toString().length}}`;
  }

  // Optional capturing group
  if (capture && source !== '' && source[0] !== '(') {
    source = `(${source})`;
  }

  return source;
}

module.exports = toRegexRange;
```