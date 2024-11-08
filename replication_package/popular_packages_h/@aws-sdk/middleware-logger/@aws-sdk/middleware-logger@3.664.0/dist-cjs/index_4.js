"use strict";

const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: { hasOwnProperty } } = Object;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, exclude, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== exclude) {
        defineProperty(to, key, { 
          get: () => from[key], 
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable 
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

const loggerMiddleware = setName(async (next, context) => async (args) => {
  const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
  const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
  const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
  const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;

  try {
    const response = await next(args);
    const { $metadata, ...outputWithoutMetadata } = response.output;

    logger?.info?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      output: outputFilterSensitiveLog(outputWithoutMetadata),
      metadata: $metadata
    });

    return response;
  } catch (error) {
    logger?.error?.({
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      error,
      metadata: error.$metadata
    });

    throw error;
  }
}, "loggerMiddleware");

const loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};

const getLoggerPlugin = setName(options => ({
  applyToStack: clientStack => {
    clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
  }
}), "getLoggerPlugin");

const src_exports = {};
exportModule(src_exports, {
  getLoggerPlugin,
  loggerMiddleware,
  loggerMiddlewareOptions
});

module.exports = toCommonJS(src_exports);
