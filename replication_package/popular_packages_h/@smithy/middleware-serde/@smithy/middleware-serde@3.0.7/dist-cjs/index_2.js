const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportProperties = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

const srcExports = {};
exportProperties(srcExports, {
  deserializerMiddleware: () => deserializerMiddleware,
  deserializerMiddlewareOption: () => deserializerMiddlewareOption,
  getSerdePlugin: () => getSerdePlugin,
  serializerMiddleware: () => serializerMiddleware,
  serializerMiddlewareOption: () => serializerMiddlewareOption
});
module.exports = toCommonJS(srcExports);

const deserializerMiddleware = setName((options, deserializer) => (next) => async (args) => {
  const { response } = await next(args);
  try {
    const parsed = await deserializer(response, options);
    return {
      response,
      output: parsed
    };
  } catch (error) {
    defineProperty(error, "$response", { value: response });
    if (!("$metadata" in error)) {
      const hint = `Deserialization error: To view the raw response, inspect {error}.$response.`;
      error.message += `\n  ${hint}`;
      if (typeof error.$responseBodyText !== "undefined" && error.$response) {
        error.$response.body = error.$responseBodyText;
      }
    }
    throw error;
  }
}, "deserializerMiddleware");

const serializerMiddleware = setName((options, serializer) => (next, context) => async (args) => {
  const endpoint = (context.endpointV2?.url && options.urlParser) ? 
    async () => options.urlParser(context.endpointV2.url) : options.endpoint;
  if (!endpoint) {
    throw new Error("No valid endpoint provider available.");
  }
  
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
