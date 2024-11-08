const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;

const defineName = (fn, name) => defineProperty(fn, 'name', { value: name, configurable: true });

function exportProperties(target, sources) {
  for (const key in sources) {
    defineProperty(target, key, { get: sources[key], enumerable: true });
  }
}

function copyProperties(target, source, except) {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!prototype.hasOwnProperty.call(target, key) && key !== except) {
        defineProperty(
          target,
          key,
          { get: () => source[key], enumerable: !getOwnPropertyDescriptor(source, key)?.enumerable }
        );
      }
    }
  }
  return target;
}

function toCommonJS(module) {
  return copyProperties(defineProperty({}, '__esModule', { value: true }), module);
}

// src/index.ts
const src_exports = {};
exportProperties(src_exports, {
  contentLengthMiddleware,
  contentLengthMiddlewareOptions,
  getContentLengthPlugin
});
module.exports = toCommonJS(src_exports);

const { HttpRequest } = require('@smithy/protocol-http');
const CONTENT_LENGTH_HEADER = 'content-length';

function contentLengthMiddleware(bodyLengthChecker) {
  return (next) => async (args) => {
    const { request } = args;
    if (HttpRequest.isInstance(request)) {
      const { body, headers } = request;
      if (body && !Object.keys(headers).map((key) => key.toLowerCase()).includes(CONTENT_LENGTH_HEADER)) {
        try {
          const length = bodyLengthChecker(body);
          request.headers = { ...request.headers, [CONTENT_LENGTH_HEADER]: String(length) };
        } catch (error) {
          // Silent catch
        }
      }
    }
    return next({ ...args, request });
  };
}
defineName(contentLengthMiddleware, 'contentLengthMiddleware');

const contentLengthMiddlewareOptions = {
  step: 'build',
  tags: ['SET_CONTENT_LENGTH', 'CONTENT_LENGTH'],
  name: 'contentLengthMiddleware',
  override: true
};

const getContentLengthPlugin = defineName((options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
  }
}), 'getContentLengthPlugin');
