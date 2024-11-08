"use strict";

const loggerMiddleware = () => (next, context) => async (args) => {
  const { clientName, commandName, logger, dynamoDbDocumentClientOptions = {} } = context;
  const inputFilterSensitiveLog = dynamoDbDocumentClientOptions.overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
  const outputFilterSensitiveLog = dynamoDbDocumentClientOptions.overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;

  try {
    const response = await next(args);
    const { $metadata, ...outputWithoutMetadata } = response.output;

    if (logger?.info) {
      logger.info({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        output: outputFilterSensitiveLog(outputWithoutMetadata),
        metadata: $metadata
      });
    }

    return response;
  } catch (error) {
    if (logger?.error) {
      logger.error({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        error,
        metadata: error.$metadata
      });
    }
    throw error;
  }
};

const loggerMiddlewareOptions = {
  name: "loggerMiddleware",
  tags: ["LOGGER"],
  step: "initialize",
  override: true
};

const getLoggerPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
  }
});

module.exports = {
  loggerMiddleware,
  loggerMiddlewareOptions,
  getLoggerPlugin
};
