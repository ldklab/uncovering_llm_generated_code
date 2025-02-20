// classNames.js - implementation file
function classNames(...args) {
  const classes = [];

  args.forEach(arg => {
    if (!arg) return;

    const argType = typeof arg;

    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(classNames(...arg));
    } else if (argType === 'object') {
      for (const key in arg) {
        if (Object.hasOwnProperty.call(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  });

  return classes.join(' ');
}

classNames.bind = function(bindStyles) {
  return function(...args) {
    return classNames(...args.map(arg => {
      if (typeof arg === 'string' || typeof arg === 'number') {
        return bindStyles[arg];
      } else if (Array.isArray(arg)) {
        return arg.map(a => classNames.bind(bindStyles)(a));
      } else if (typeof arg === 'object') {
        const obj = {};
        for (const key in arg) {
          if (Object.hasOwnProperty.call(arg, key)) {
            obj[bindStyles[key] || key] = arg[key];
          }
        }
        return obj;
      }
      return arg;
    }));
  };
};

module.exports = classNames;

// tests/demo usage
const styles = {
  foo: 'abc',
  bar: 'def',
  baz: 'xyz',
};

// Example usage
console.log(classNames('foo', { bar: true, duck: false }, 'baz', { quux: true })); 
// Output: 'foo bar baz quux'

const cx = classNames.bind(styles);

console.log(cx('foo', ['bar'], { baz: true })); 
// Output: 'abc def xyz'
