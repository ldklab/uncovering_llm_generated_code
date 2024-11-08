// Utility Methods
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const setName = (fn, name) => defineProperty(fn, 'name', { value: name, configurable: true });

// Module Export Helpers
const exportProperties = (target, modules) => {
  for (const name in modules)
    defineProperty(target, name, { get: modules[name], enumerable: true });
};

const copyProperties = (destination, source, exclude, descriptor) => {
  if (source && (typeof source === 'object' || typeof source === 'function')) {
    for (const key of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(destination, key) && key !== exclude) {
        defineProperty(destination, key, {
          get: () => source[key],
          enumerable: !(descriptor = getOwnPropertyDescriptor(source, key)) || descriptor.enumerable
        });
      }
    }
  }
  return destination;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, '__esModule', { value: true }), mod);

// Middleware and Plugins
const deserializerMiddleware = setName((options, deserializer) => (next) => async (args) => {
  const { response } = await next(args);
  try {
    const parsedOutput = await deserializer(response, options);
    return { response, output: parsedOutput };
  } catch (error) {
    defineProperty(error, '$response', { value: response });

    if (!('$metadata' in error)) {
      error.message += "\n  Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.";
      if (typeof error.$responseBodyText !== "undefined" && error.$response) {
        error.$response.body = error.$responseBodyText;
      }
    }

    throw error;
  }
}, "deserializerMiddleware");

const serializerMiddleware = setName((options, serializer) => (next, context) => async (args) => {
  const endpoint = (context.endpointV2?.url && options.urlParser)
    ? async () => options.urlParser(context.endpointV2.url)
    : options.endpoint;

  if (!endpoint) throw new Error("No valid endpoint provider available.");

  const request = await serializer(args.input, { ...options, endpoint });
  return next({ ...args, request });
}, "serializerMiddleware");

const deserializerMiddlewareOption = {
  name: "deserializerMiddleware",
  step: "deserialize",
  tags: ["DESERIALIZER"],
  override: true
};

const serializerMiddlewareOption = {
  name: "serializerMiddleware",
  step: "serialize",
  tags: ["SERIALIZER"],
  override: true
};

function getSerdePlugin(config, serializer, deserializer) {
  return {
    applyToStack: (commandStack) => {
      commandStack.add(deserializerMiddleware(config, deserializer), deserializerMiddlewareOption);
      commandStack.add(serializerMiddleware(config, serializer), serializerMiddlewareOption);
    }
  };
}
setName(getSerdePlugin, "getSerdePlugin");

// Annotate the CommonJS export names for ESM import in node:
exportProperties(module.exports = {}, {
  deserializerMiddleware,
  deserializerMiddlewareOption,
  getSerdePlugin,
  serializerMiddleware,
  serializerMiddlewareOption
});
