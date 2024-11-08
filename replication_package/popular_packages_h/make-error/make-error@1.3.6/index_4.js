// ISC @ Julien Fontanet

"use strict";

const construct = typeof Reflect !== "undefined" ? Reflect.construct : undefined;
const defineProperty = Object.defineProperty;

let captureStackTrace = Error.captureStackTrace;
if (!captureStackTrace) {
  captureStackTrace = function(error) {
    const container = new Error();

    defineProperty(error, "stack", {
      configurable: true,
      get() {
        const stack = container.stack;
        defineProperty(this, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });
        return stack;
      },
      set(stack) {
        defineProperty(error, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });
      },
    });
  };
}

function BaseError(message) {
  if (message !== undefined) {
    defineProperty(this, "message", {
      configurable: true,
      value: message,
      writable: true,
    });
  }

  const cname = this.constructor.name;
  if (cname && cname !== this.name) {
    defineProperty(this, "name", {
      configurable: true,
      value: cname,
      writable: true,
    });
  }

  captureStackTrace(this, this.constructor);
}

BaseError.prototype = Object.create(Error.prototype, {
  constructor: {
    configurable: true,
    value: BaseError,
    writable: true,
  },
});

const setFunctionName = (() => {
  try {
    const f = function() {};
    defineProperty(f, "name", { configurable: true, value: "foo" });
    if (f.name === "foo") return (fn, name) => defineProperty(fn, "name", { configurable: true, value: name });
  } catch (_) {}
})();

function makeError(constructor, super_ = BaseError) {
  if (typeof super_ !== "function") {
    throw new TypeError("super_ should be a function");
  }

  let name;
  if (typeof constructor === "string") {
    name = constructor;
    constructor = construct 
      ? function() { return construct(super_, arguments, this.constructor); }
      : function() { super_.apply(this, arguments); };

    if (setFunctionName) {
      setFunctionName(constructor, name);
      name = undefined;
    }
  } else if (typeof constructor !== "function") {
    throw new TypeError("constructor should be either a string or a function");
  }

  constructor.super_ = constructor["super"] = super_;

  const properties = { constructor: { configurable: true, value: constructor, writable: true } };
  if (name !== undefined) {
    properties.name = { configurable: true, value: name, writable: true };
  }
  
  constructor.prototype = Object.create(super_.prototype, properties);

  return constructor;
}

module.exports = makeError;
module.exports.BaseError = BaseError;
