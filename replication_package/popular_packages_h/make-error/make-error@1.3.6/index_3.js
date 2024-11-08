"use strict";

const defineProperty = Object.defineProperty;

// Capture the stack trace or polyfill if `Error.captureStackTrace` is not available
let captureStackTrace = Error.captureStackTrace || function(error) {
  const container = new Error();
  defineProperty(error, "stack", {
    configurable: true,
    get() {
      const stack = container.stack;
      defineProperty(error, "stack", { configurable: true, value: stack, writable: true });
      return stack;
    },
    set(stack) {
      defineProperty(error, "stack", { configurable: true, value: stack, writable: true });
    }
  });
};

// Custom BaseError constructor extending native Error
function BaseError(message) {
  if (message !== undefined) {
    defineProperty(this, "message", { configurable: true, value: message, writable: true });
  }

  const cname = this.constructor.name;
  if (cname !== this.name) {
    defineProperty(this, "name", { configurable: true, value: cname, writable: true });
  }

  captureStackTrace(this, this.constructor);
}

BaseError.prototype = Object.create(Error.prototype, {
  constructor: {
    configurable: true,
    value: BaseError,
    writable: true,
  }
});

// Set function name utility
const setFunctionName = (() => {
  try {
    const f = function() {};
    defineProperty(f, "name", { value: "foo", configurable: true });
    return f.name === "foo" ? (fn, name) => defineProperty(fn, "name", { value: name, configurable: true }) : undefined;
  } catch { }
})();

// Make custom error constructor
function makeError(constructor, superConstructor = BaseError) {
  if (typeof superConstructor !== "function") {
    throw new TypeError("superConstructor should be a function");
  }

  let name;
  if (typeof constructor === "string") {
    name = constructor;
    constructor = (() => {
      return function() {
        return (typeof Reflect === "undefined" ? superConstructor.apply(this, arguments)
                                                : Reflect.construct(superConstructor, arguments, this.constructor));
      };
    })();

    if (setFunctionName) {
      setFunctionName(constructor, name);
      name = undefined;
    }
  } else if (typeof constructor !== "function") {
    throw new TypeError("constructor should be either a string or a function");
  }

  constructor.super_ = superConstructor;

  constructor.prototype = Object.create(superConstructor.prototype, {
    constructor: { configurable: true, value: constructor, writable: true },
    ...(name && { name: { configurable: true, value: name, writable: true } })
  });

  return constructor;
}

module.exports = makeError;
module.exports.BaseError = BaseError;
