// This code provides two utility functions for constructing class name strings. The main function, `clsx`, takes multiple arguments of different types (strings, numbers, arrays, and objects) and returns a string of class names. Each argument is processed recursively to account for nested arrays or objects. Boolean or falsy values are used to determine whether to include certain class names in the resulting string. The `clsxLite` handles only string arguments, joining them with spaces if they are truthy.

function toVal(mix) {
  let str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (Array.isArray(mix)) {
    for (let i = 0; i < mix.length; i++) {
      if (mix[i]) {
        const x = toVal(mix[i]);
        if (x) str && (str += ' '), (str += x);
      }
    }
  } else if (typeof mix === 'object') {
    for (const k in mix) {
      if (mix[k]) {
        str && (str += ' '), (str += k);
      }
    }
  }
  return str;
}

function clsx(...args) {
  let i = 0, tmp, x, str = '';
  while (i < args.length) {
    if ((tmp = args[i++])) {
      if ((x = toVal(tmp))) {
        str && (str += ' '), (str += x);
      }
    }
  }
  return str;
}

export default clsx;

// Lite version of clsx that only handles strings
export function clsxLite(...args) {
  return args.filter(Boolean).join(' ');
}

// Usage demo
import clsx from './clsx';

console.log(clsx('foo', true && 'bar', 'baz')); // 'foo bar baz'
console.log(clsx({ foo: true, bar: false, baz: true })); // 'foo baz'
console.log(clsx(['foo', 0, false, 'bar'])); // 'foo bar'
```