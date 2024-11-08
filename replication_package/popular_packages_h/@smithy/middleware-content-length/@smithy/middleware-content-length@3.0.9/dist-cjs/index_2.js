const { HttpRequest } = require("@smithy/protocol-http");

const CONTENT_LENGTH_HEADER = "content-length";

// Helper functions for property definitions and exports
function defineProperty(obj, prop, descriptor) {
  Object.defineProperty(obj, prop, descriptor);
}

function getOwnPropertyDescriptor(obj, prop) {
  return Object.getOwnPropertyDescriptor(obj, prop);
}

function getOwnPropertyNames(obj) {
  return Object.getOwnPropertyNames(obj);
}

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function setName(func, name) {
  return defineProperty(func, "name", { value: name, configurable: true });
}

function exportProperties(target, source) {
  for (const key in source) {
    defineProperty(target, key, { get: source[key], enumerable: true });
  }
}

function copyProperties(dest, src, exclude, descriptor) {
  if (src && (typeof src === "object" || typeof src === "function")) {
    for (const key of getOwnPropertyNames(src)) {
      if (!hasOwnProperty(dest, key) && key !== exclude) {
        defineProperty(dest, key, {
          get: () => src[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(src, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return dest;
}

function toCommonJS(mod) {
  return copyProperties(defineProperty({}, "__esModule", { value: true }), mod);
}

// Middleware and Plugin definitions
function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const request = args.request;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && !Object.keys(headers).map((key) => key.toLowerCase()).includes(CONTENT_LENGTH_HEADER)) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = {
            ...request.headers,
            [CONTENT_LENGTH_HEADER]: String(length),
          };
        } catch (error) {
          // Error handling can be added here if required
        }
      }
    }
    return next({
      ...args,
      request,
    });
  };
}

setName(contentLengthMiddleware, "contentLengthMiddleware");

const contentLengthMiddlewareOptions = {
  step: "build",
  tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
  name: "contentLengthMiddleware",
  override: true,
};

const getContentLengthPlugin = setName((options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  },
}), "getContentLengthPlugin");

// Export for CommonJS
module.exports = toCommonJS({
  contentLengthMiddleware,
  contentLengthMiddlewareOptions,
  getContentLengthPlugin,
});
