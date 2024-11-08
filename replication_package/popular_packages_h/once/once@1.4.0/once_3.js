const wrappy = require('wrappy');

// Expose the once function wrapped with wrappy as the main module export
const once = wrappy(makeOnce);
const onceStrict = wrappy(makeOnceStrict);
module.exports = once;
module.exports.strict = onceStrict;

// Add methods to Function.prototype to enable function wrapping
once.proto = once(function () {
  Object.defineProperties(Function.prototype, {
    'once': {
      value: function () {
        return once(this);
      },
      configurable: true
    },
    'onceStrict': {
      value: function () {
        return onceStrict(this);
      },
      configurable: true
    }
  });
});

// A generic function wrapper that ensures the passed function runs only once
function makeOnce(fn) {
  let called = false;
  let value;

  return function wrappedOnce() {
    if (called) return value;
    called = true;
    value = fn.apply(this, arguments);
    return value;
  };
}

// A strict variant of the once wrapper that throws an error on subsequent calls
function makeOnceStrict(fn) {
  let called = false;
  const functionName = fn.name || 'Function wrapped with `onceStrict`';
  const onceError = `${functionName} shouldn't be called more than once`;
  let value;

  return function wrappedOnceStrict() {
    if (called) {
      throw new Error(onceError);
    }
    called = true;
    value = fn.apply(this, arguments);
    return value;
  };
}
