function fillRange(from, to, step = 1, options = {}) {
  const isNumber = value => !isNaN(value);
  const isAlphabet = value => /^[a-zA-Z]$/.test(value);

  const createSequence = (start, end, step, transform) => {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(transform ? transform(i) : i);
    }
    return result;
  };

  const transformValue = options.transform || (v => v);

  if (isNumber(from) && isNumber(to)) {
    from = parseInt(from, 10);
    to = parseInt(to, 10);
    if (options.toRegex) {
      return `[${from}-${to}]`;
    }
    const values = createSequence(from, to, step, transformValue);
    return options.stringify ? values.map(String) : values;
  }

  if (isAlphabet(from) && isAlphabet(to)) {
    from = from.charCodeAt(0);
    to = to.charCodeAt(0);
    const values = createSequence(from, to, step, charCode => transformValue(String.fromCharCode(charCode)));
    if (options.toRegex) {
      return `[${String.fromCharCode(from)}-${String.fromCharCode(to)}]`;
    }
    return values;
  }

  if (options.strictRanges) {
    throw new RangeError('Invalid range');
  }

  return null;
}

module.exports = fillRange;

// Usage Examples
const fill = require('./fillRange');

console.log(fill('1', '10')); //=> ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
console.log(fill('a', 'e')); //=> ['a', 'b', 'c', 'd', 'e']
console.log(fill('1', '10', 2)); //=> ['1', '3', '5', '7', '9']
console.log(fill('a', 'z', 3, { toRegex: true })); //=> '[a-z]'
```