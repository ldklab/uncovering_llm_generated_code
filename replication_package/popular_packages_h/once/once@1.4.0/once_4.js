const wrappy = require('wrappy');

// Wrapping the functions 'once' and 'onceStrict' with 'wrappy' 
module.exports = wrappy(once);
module.exports.strict = wrappy(onceStrict);

// Adding functionalities to Function prototype 
once.proto = once(function () {
  // Add 'once' method to Function prototype
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this);
    },
    configurable: true
  });

  // Add 'onceStrict' method to Function prototype
  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this);
    },
    configurable: true
  });
});

// Function that ensures another function runs only once
function once(fn) {
  const f = function () {
    if (f.called) return f.value;
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  f.called = false;
  return f;
}

// Similar function to 'once', but throws an error if called more than once
function onceStrict(fn) {
  const f = function () {
    if (f.called) throw new Error(f.onceError);
    f.called = true;
    return f.value = fn.apply(this, arguments);
  };
  const name = fn.name || 'Function wrapped with `once`';
  f.onceError = `${name} shouldn't be called more than once`;
  f.called = false;
  return f;
}
