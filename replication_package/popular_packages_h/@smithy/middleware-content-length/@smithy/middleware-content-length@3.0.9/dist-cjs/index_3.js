// Helper functions for defining properties and managing exports
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// Utility function to set the name of a function
const setName = (func, name) => {
  defineProperty(func, 'name', { value: name, configurable: true });
};

// Exporting helper
const exportProperties = (target, properties) => {
  for (const key in properties) {
    defineProperty(target, key, {
      get: properties[key],
      enumerable: true,
    });
  }
};

// Copy properties from one object to another
const copyProperties = (target, source, exclude, defaultDescriptor) => {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, key) && key !== exclude) {
        defineProperty(target, key, {
          get: () => source[key],
          enumerable: !(defaultDescriptor = getOwnPropertyDescriptor(source, key)) || defaultDescriptor.enumerable,
        });
      }
    }
  }
  return target;
};

// Convert module to be compatible with CommonJS
const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// src/index.ts
const src_exports = {};

exportProperties(src_exports, {
  contentLengthMiddleware,
  contentLengthMiddlewareOptions,
  getContentLengthPlugin,
});

module.exports = toCommonJS(src_exports);

// Required dependencies
const { HttpRequest } = require('@smithy/protocol-http');

// Constants
const CONTENT_LENGTH_HEADER = 'content-length';

// Middleware function to set the Content-Length header
function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const request = args.request;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && !Object.keys(headers).some(key => key.toLowerCase() === CONTENT_LENGTH_HEADER)) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = {
            ...headers,
            [CONTENT_LENGTH_HEADER]: String(length),
          };
        } catch (error) {
          // Handle error if needed
        }
      }
    }
    return next({ ...args, request });
  };
}
setName(contentLengthMiddleware, 'contentLengthMiddleware');

// Middleware options configuration
const contentLengthMiddlewareOptions = {
  step: 'build',
  tags: ['SET_CONTENT_LENGTH', 'CONTENT_LENGTH'],
  name: 'contentLengthMiddleware',
  override: true,
};

// Plugin to apply the middleware
const getContentLengthPlugin = setName((options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  }
}), 'getContentLengthPlugin');

// Annotate CommonJS export names for ESM imports
0 && (module.exports = {
  contentLengthMiddleware,
  contentLengthMiddlewareOptions,
  getContentLengthPlugin,
});
