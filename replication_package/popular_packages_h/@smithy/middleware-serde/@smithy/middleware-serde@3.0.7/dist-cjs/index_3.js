// Utility functions for property definition and export handling
const defineProperty = Object.defineProperty;
const getPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const assignName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportAll = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (module) => copyProperties(defineProperty({}, "__esModule", { value: true }), module);

// src/index.ts
const exports = {};
exportAll(exports, {
  deserializerMiddleware: () => deserializerMiddleware,
  deserializerMiddlewareOption: () => deserializerMiddlewareOption,
  getSerdePlugin: () => getSerdePlugin,
  serializerMiddleware: () => serializerMiddleware,
  serializerMiddlewareOption: () => serializerMiddlewareOption,
});
module.exports = toCommonJS(exports);

// src/deserializerMiddleware.ts
const deserializerMiddleware = /* @__PURE__ */ assignName((options, deserializer) => (next) => async (args) => {
  const { response } = await next(args);
  try {
    const parsed = await deserializer(response, options);
    return { response, output: parsed };
  } catch (error) {
    defineProperty(error, "$response", { value: response });
    if (!("$metadata" in error)) {
      const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
      error.message += "\n  " + hint;
      if (typeof error.$responseBodyText !== "undefined" && error.$response) {
        error.$response.body = error.$responseBodyText;
      }
    }
    throw error;
  }
}, "deserializerMiddleware");

// src/serializerMiddleware.ts
const serializerMiddleware = /* @__PURE__ */ assignName((options, serializer) => (next, context) => async (args) => {
  const endpoint = (context.endpointV2?.url && options.urlParser) ? async () => options.urlParser(context.endpointV2.url) : options.endpoint;
  if (!endpoint) {
    throw new Error("No valid endpoint provider available.");
  }
  const request = await serializer(args.input, { ...options, endpoint });
  return next({ ...args, request });
}, "serializerMiddleware");

// src/serdePlugin.ts
const deserializerMiddlewareOption = {
  name: "deserializerMiddleware",
  step: "deserialize",
  tags: ["DESERIALIZER"],
  override: true,
};

const serializerMiddlewareOption = {
  name: "serializerMiddleware",
  step: "serialize",
  tags: ["SERIALIZER"],
  override: true,
};

function getSerdePlugin(config, serializer, deserializer) {
  return {
    applyToStack: (commandStack) => {
      commandStack.add(deserializerMiddleware(config, deserializer), deserializerMiddlewareOption);
      commandStack.add(serializerMiddleware(config, serializer), serializerMiddlewareOption);
    },
  };
}
assignName(getSerdePlugin, "getSerdePlugin");

// Annotate the CommonJS export names for ESM import in Node:
0 && (module.exports = {
  deserializerMiddleware,
  deserializerMiddlewareOption,
  serializerMiddlewareOption,
  getSerdePlugin,
  serializerMiddleware,
});
