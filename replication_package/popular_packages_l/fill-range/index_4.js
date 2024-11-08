function fillRange(start, end, step = 1, options = {}) {
  const isNumber = n => !isNaN(n);
  const isLetter = char => /^[a-zA-Z]$/.test(char);

  const generateSequence = (begin, finish, increment, convert) => {
    const sequence = [];
    for (let i = begin; i <= finish; i += increment) {
      sequence.push(convert ? convert(i) : i);
    }
    return sequence;
  };

  const transform = options.transform || (val => val);

  if (isNumber(start) && isNumber(end)) {
    start = Number(start);
    end = Number(end);
    if (options.toRegex) {
      return `[${start}-${end}]`;
    }
    const nums = generateSequence(start, end, step, transform);
    return options.stringify ? nums.map(String) : nums;
  }

  if (isLetter(start) && isLetter(end)) {
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    const chars = generateSequence(start, end, step, charCode => transform(String.fromCharCode(charCode)));
    if (options.toRegex) {
      return `[${String.fromCharCode(start)}-${String.fromCharCode(end)}]`;
    }
    return chars;
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