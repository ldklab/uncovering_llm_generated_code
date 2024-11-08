function fillRange(from, to, step = 1, options = {}) {
  const isNumeric = value => !isNaN(value);
  const isLetter = value => /^[a-zA-Z]$/.test(value);

  const generateSequence = (start, end, step, transformation) => {
    const sequence = [];
    for (let index = start; index <= end; index += step) {
      sequence.push(transformation ? transformation(index) : index);
    }
    return sequence;
  };

  const transformationFunction = options.transform || (value => value);

  if (isNumeric(from) && isNumeric(to)) {
    from = Number(from);
    to = Number(to);
    if (options.toRegex) {
      return `[${from}-${to}]`;
    }
    const sequence = generateSequence(from, to, step, transformationFunction);
    return options.stringify ? sequence.map(String) : sequence;
  }

  if (isLetter(from) && isLetter(to)) {
    from = from.charCodeAt(0);
    to = to.charCodeAt(0);
    const sequence = generateSequence(from, to, step, codePoint => transformationFunction(String.fromCharCode(codePoint)));
    if (options.toRegex) {
      return `[${String.fromCharCode(from)}-${String.fromCharCode(to)}]`;
    }
    return sequence;
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
console.log(fill('a', 'z', 3, { toRegex: true })); //=> '[a-y]'
```