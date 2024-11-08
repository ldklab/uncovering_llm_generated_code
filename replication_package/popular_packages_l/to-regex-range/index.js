// to-regex-range.js

function toRegexRange(min, max, options = {}) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected min and max to be numbers');
  }
  
  if (min > max) [min, max] = [max, min];

  const { capture, shorthand, relaxZeros = true } = options;
  const zeroPad = relaxZeros ? `{0,}` : `{}`;

  const rangeSegments = (range) => {
    if (range.length === 1) {
      return `[${range[0]}]`;
    } 
    return `[${range[0]}-${range[1]}]`;
  };

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
  if (min < 1) {
    source += '-?';
  }
  if (!shorthand) {
    source += buildRange(min, max);
  } else {
    source += `\\d{${min.toString().length},${max.toString().length}}`;
  }

  if (capture && source !== '' && source[0] !== '(') {
    source = `(${source})`;
  }

  return source;
}

module.exports = toRegexRange;
```

This function can be utilized in a JavaScript application to generate regex strings that match specific numeric ranges effectively.