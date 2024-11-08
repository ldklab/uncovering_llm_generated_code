const wrappy = require('wrappy');

// Export a wrapped 'once' function
module.exports = wrappy(once);

// Export a wrapped 'onceStrict' function as 'strict'
module.exports.strict = wrappy(onceStrict);

// Extend Function prototype with 'once' and 'onceStrict' methods
once.proto = once(() => {
  Object.defineProperty(Function.prototype, 'once', {
    value: function() {
      return once(this);
    },
    configurable: true,
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function() {
      return onceStrict(this);
    },
    configurable: true,
  });
});

// 'once' function: Executes the input function only once
function once(fn) {
  const f = function() {
    if (f.called) return f.value;
    f.called = true;
    f.value = fn.apply(this, arguments);
    return f.value;
  };
  f.called = false;
  return f;
}

// 'onceStrict' function: Executes the input function only once, throws an error if called again
function onceStrict(fn) {
  const f = function() {
    if (f.called) throw new Error(f.onceError);
    f.called = true;
    f.value = fn.apply(this, arguments);
    return f.value;
  };

  // Create a custom error message with the function's name
  const functionName = fn.name || 'Function wrapped with `once`';
  f.onceError = `${functionName} shouldn't be called more than once`;
  f.called = false;
  return f;
}
