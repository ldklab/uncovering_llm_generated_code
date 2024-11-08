// clsx.js

function toVal(mix) {
  let str = '';
  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (Array.isArray(mix)) {
    mix.forEach(item => {
      if (item) {
        const x = toVal(item);
        if (x) str && (str += ' '), (str += x);
      }
    });
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
  let str = '';
  args.forEach(arg => {
    const x = toVal(arg);
    if (x) {
      str && (str += ' '), (str += x);
    }
  });
  return str;
}

export default clsx;

// clsx-lite.js
export function clsxLite(...args) {
  return args.filter(arg => arg).join(' ');
}

// Usage demo
import clsx from './clsx';

console.log(clsx('foo', true && 'bar', 'baz')); // 'foo bar baz'
console.log(clsx({ foo: true, bar: false, baz: true })); // 'foo baz'
console.log(clsx(['foo', 0, false, 'bar'])); // 'foo bar'
```