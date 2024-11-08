const wrappy = require('wrappy');

const once = (fn) => {
  const wrappedFunction = function () {
    if (wrappedFunction.called) {
      return wrappedFunction.value;
    }
    wrappedFunction.called = true;
    return (wrappedFunction.value = fn.apply(this, arguments));
  };
  wrappedFunction.called = false;
  return wrappedFunction;
};

const onceStrict = (fn) => {
  const wrappedFunction = function () {
    if (wrappedFunction.called) {
      throw new Error(wrappedFunction.onceError);
    }
    wrappedFunction.called = true;
    return (wrappedFunction.value = fn.apply(this, arguments));
  };
  const functionName = fn.name || 'Function wrapped with `once`';
  wrappedFunction.onceError = `${functionName} shouldn't be called more than once`;
  wrappedFunction.called = false;
  return wrappedFunction;
};

module.exports = wrappy(once);
module.exports.strict = wrappy(onceStrict);

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this);
    },
    configurable: true,
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this);
    },
    configurable: true,
  });
});
