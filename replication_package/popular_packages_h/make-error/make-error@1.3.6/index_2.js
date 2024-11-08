// ISC @ Julien Fontanet

"use strict";

// Compatibility handling for Reflect.construct
var construct = typeof Reflect !== "undefined" ? Reflect.construct : undefined;
var defineProperty = Object.defineProperty;

// Implements a custom stack trace capture for environments without Error.captureStackTrace
var captureStackTrace = Error.captureStackTrace;
if (captureStackTrace === undefined) {
  captureStackTrace = function captureStackTrace(error) {
    var container = new Error();

    defineProperty(error, "stack", {
      configurable: true,
      get: function getStack() {
        var stack = container.stack;
        defineProperty(this, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });

        return stack;
      },
      set: function setStack(stack) {
        defineProperty(error, "stack", {
          configurable: true,
          value: stack,
          writable: true,
        });
      },
    });
  };
}

// BaseError constructor for custom error objects
function BaseError(message) {
  if (message !== undefined) {
    defineProperty(this, "message", {
      configurable: true,
      value: message,
      writable: true,
    });
  }

  var cname = this.constructor.name;
  if (cname !== undefined && cname !== this.name) {
    defineProperty(this, "name", {
      configurable: true,
      value: cname,
      writable: true,
    });
  }

  captureStackTrace(this, this.constructor);
}

// Setting up the prototype chain for BaseError
BaseError.prototype = Object.create(Error.prototype, {
  constructor: {
    configurable: true,
    value: BaseError,
    writable: true,
  },
});

// Attempts to set the name of a function if possible within the environment
var setFunctionName = (function() {
  function setFunctionName(fn, name) {
    return defineProperty(fn, "name", {
      configurable: true,
      value: name,
    });
  }
  try {
    var f = function() {};
    setFunctionName(f, "foo");
    if (f.name === "foo") {
      return setFunctionName;
    }
  } catch (_) {}
})();

// Factory function to create new error types
function makeError(constructor, super_) {
  if (super_ == null || super_ === Error) {
    super_ = BaseError;
  } else if (typeof super_ !== "function") {
    throw new TypeError("super_ should be a function");
  }

  var name;
  if (typeof constructor === "string") {
    name = constructor;
    constructor =
      construct !== undefined
        ? function() {
            return construct(super_, arguments, this.constructor);
          }
        : function() {
            super_.apply(this, arguments);
          };

    if (setFunctionName !== undefined) {
      setFunctionName(constructor, name);
      name = undefined;
    }
  } else if (typeof constructor !== "function") {
    throw new TypeError("constructor should be either a string or a function");
  }

  constructor.super_ = constructor["super"] = super_;

  var properties = {
    constructor: {
      configurable: true,
      value: constructor,
      writable: true,
    },
  };

  if (name !== undefined) {
    properties.name = {
      configurable: true,
      value: name,
      writable: true,
    };
  }
  constructor.prototype = Object.create(super_.prototype, properties);

  return constructor;
}

exports = module.exports = makeError;
exports.BaseError = BaseError;
