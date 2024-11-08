const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

function setFunctionName(fn, name) {
  return __defProp(fn, "name", { value: name, configurable: true });
}

function exportProperties(target, properties) {
  for (let key in properties) {
    __defProp(target, key, { get: properties[key], enumerable: true });
  }
}

function copyProperties(to, from, except) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: true });
      }
    }
  }
  return to;
}

function toCommonJSExport(mod) {
  const result = {};
  copyProperties(result, mod);
  __defProp(result, "__esModule", { value: true });
  return result;
}

// src/index.ts
const exports = {};
exportProperties(exports, {
  deserializerMiddleware: () => deserializerMiddleware,
  deserializerMiddlewareOption: () => deserializerMiddlewareOption,
  getSerdePlugin: () => getSerdePlugin,
  serializerMiddleware: () => serializerMiddleware,
  serializerMiddlewareOption: () => serializerMiddlewareOption
});
module.exports = toCommonJSExport(exports);

// src/deserializerMiddleware.ts
const deserializerMiddleware = setFunctionName((options, deserializer) => (next) => async (args) => {
  const { response } = await next(args);
  try {
    const parsed = await deserializer(response, options);
    return { response, output: parsed };
  } catch (error) {
    __defProp(error, "$response", { value: response });
    if (!("metadata" in error)) {
      error.message += "\n  Deserialization error: check {error}.$response for raw response.";
      if (error.$responseBodyText) {
        error.$response.body = error.$responseBodyText;
      }
    }
    throw error;
  }
}, "deserializerMiddleware");

// src/serializerMiddleware.ts
const serializerMiddleware = setFunctionName((options, serializer) => (next, context) => async (args) => {
  const endpoint = context?.endpointV2?.url && options.urlParser 
    ? async () => options.urlParser(context.endpointV2.url) : options.endpoint;

  if (!endpoint) throw new Error("No valid endpoint provider available.");

  const request = await serializer(args.input, { ...options, endpoint });
  return next({ ...args, request });
}, "serializerMiddleware");

// src/serdePlugin.ts
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
setFunctionName(getSerdePlugin, "getSerdePlugin");

// 0 && (module.exports = { deserializerMiddleware, deserializerMiddlewareOption, serializerMiddleware, serializerMiddlewareOption, getSerdePlugin });
