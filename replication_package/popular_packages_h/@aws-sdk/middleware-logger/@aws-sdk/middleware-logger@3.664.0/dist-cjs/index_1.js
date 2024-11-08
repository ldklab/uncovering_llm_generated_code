"use strict";

// Utility functions for module export
const __defineProperty = Object.defineProperty;
const __getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const __getOwnPropertyNames = Object.getOwnPropertyNames;
const __hasOwnProperty = Object.prototype.hasOwnProperty;

const defineName = (target, value) => __defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (const name in all) {
    __defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropertyNames(from)) {
      if (!__hasOwnProperty.call(to, key) && key !== except) {
        __defineProperty(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(__defineProperty({}, "__esModule", { value: true }), mod);

// Exported entities
const exports = {};
exportModule(exports, {
  getLoggerPlugin: () => getLoggerPlugin,
  loggerMiddleware: () => loggerMiddleware,
  loggerMiddlewareOptions: () => loggerMiddlewareOptions
});
module.exports = toCommonJS(exports);

// Logger middleware definition
const loggerMiddleware = async (next, context) => async (args) => {
  let loggerInfo, loggerError;
  const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
  const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
  const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
  const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;

  try {
    const response = await next(args);
    const { $metadata, ...outputWithoutMetadata } = response.output;
    loggerInfo = logger?.info;
    loggerInfo?.call(logger, {
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      output: outputFilterSensitiveLog(outputWithoutMetadata),
      metadata: $metadata
    });
    return response;
  } catch (error) {
    loggerError = logger?.error;
    loggerError?.call(logger, {
      clientName,
      commandName,
      input: inputFilterSensitiveLog(args.input),
      error,
      metadata: error.$metadata
    });
    throw error;
  }
};

defineName(loggerMiddleware, "loggerMiddleware");

// Middleware options
const loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};

// Logger plugin definition
const getLoggerPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(loggerMiddleware, loggerMiddlewareOptions);
  }
});

defineName(getLoggerPlugin, "getLoggerPlugin");
