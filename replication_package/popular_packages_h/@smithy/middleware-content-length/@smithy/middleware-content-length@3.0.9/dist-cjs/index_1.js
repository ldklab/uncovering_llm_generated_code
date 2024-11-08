const { HttpRequest } = require("@smithy/protocol-http");

const CONTENT_LENGTH_HEADER = "content-length";

function defineProperty(target, key, descriptor) {
  Object.defineProperty(target, key, descriptor);
}

function exportAll(target, exports) {
  for (const key in exports) {
    if (Object.prototype.hasOwnProperty.call(exports, key)) {
      defineProperty(target, key, { get: exports[key], enumerable: true });
    }
  }
}

function copyProperties(target, source, exclude, descriptor) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    Object.getOwnPropertyNames(source).forEach((key) => {
      if (!target.hasOwnProperty(key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !((descriptor = Object.getOwnPropertyDescriptor(source, key)) && !descriptor.enumerable),
        });
      }
    });
  }
  return target;
}

function toCommonJSModule(mod) {
  return copyProperties({}, mod, '__esModule', { value: true });
}

function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && !Object.keys(headers).some((header) => header.toLowerCase() === CONTENT_LENGTH_HEADER)) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = {
            ...headers,
            [CONTENT_LENGTH_HEADER]: String(length),
          };
        } catch (error) {
          // Handle error if necessary
        }
      }
    }
    return next({ ...args, request });
  };
}
defineProperty(contentLengthMiddleware, "name", { value: "contentLengthMiddleware", configurable: true });

const contentLengthMiddlewareOptions = {
  step: "build",
  tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
  name: "contentLengthMiddleware",
  override: true,
};

const getContentLengthPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  },
});
defineProperty(getContentLengthPlugin, "name", { value: "getContentLengthPlugin", configurable: true });

const exports = {};
exportAll(exports, {
  contentLengthMiddleware: () => contentLengthMiddleware,
  contentLengthMiddlewareOptions: () => contentLengthMiddlewareOptions,
  getContentLengthPlugin: () => getContentLengthPlugin,
});

module.exports = toCommonJSModule(exports);
