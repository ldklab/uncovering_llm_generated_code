// clsx.js

function toVal(mix) {
  let str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    // If mix is a string or number, convert it directly to a string
    str += mix;
  } else if (Array.isArray(mix)) {
    // If mix is an array, iterate through its elements
    for (let i = 0; i < mix.length; i++) {
      if (mix[i]) {
        // Recursively call toVal on each element and append the result
        const x = toVal(mix[i]);
        if (x) {
          str && (str += ' ');
          str += x;
        }
      }
    }
  } else if (typeof mix === 'object') {
    // If mix is an object, iterate through its keys
    for (const k in mix) {
      // Append the key if its corresponding value is truthy
      if (mix[k]) {
        str && (str += ' ');
        str += k;
      }
    }
  }
  return str;
}

function clsx(...args) {
  // Flatten all arguments into a single space-separated string
  let i = 0, tmp, x, str = '';
  while (i < args.length) {
    if ((tmp = args[i++])) {
      if ((x = toVal(tmp))) {
        str && (str += ' ');
        str += x;
      }
    }
  }
  return str;
}

export default clsx;

// Create a lighter version for `/lite`, which only handles string arguments
// clsx-lite.js

export function clsxLite(...args) {
  // Join all arguments to a string with spaces in between, ignoring falsy values
  return args.filter(Boolean).join(' ');
}

// Usage demo
import clsx from './clsx';

console.log(clsx('foo', true && 'bar', 'baz')); // 'foo bar baz'
console.log(clsx({ foo: true, bar: false, baz: true })); // 'foo baz'
console.log(clsx(['foo', 0, false, 'bar'])); // 'foo bar'
```