"use strict";

// Helper functions to define and copy properties
const defineProperty = Object.defineProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const defineName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportModule = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};

const copyProperties = (to, from, except, desc) => {
  if (typeof from === "object" || typeof from === "function") {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = Object.getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Exports object
const src_exports = {};

// Logger Middleware
const loggerMiddleware = defineName(
  () => (next, context) => async (args) => {
    try {
      const response = await next(args);
      const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
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
      const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      logger?.error?.({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        error,
        metadata: error.$metadata
      });
      throw error;
    }
  }, 
  "loggerMiddleware"
);

// Middleware options
const loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};

// Plugin to add the middleware to the stack
const getLoggerPlugin = defineName(
  (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
    }
  }), 
  "getLoggerPlugin"
);

// Export functions
exportModule(src_exports, {
  getLoggerPlugin: () => getLoggerPlugin,
  loggerMiddleware: () => loggerMiddleware,
  loggerMiddlewareOptions: () => loggerMiddlewareOptions
});

module.exports = toCommonJS(src_exports);

0 && (module.exports = {
  loggerMiddleware,
  loggerMiddlewareOptions,
  getLoggerPlugin
});
