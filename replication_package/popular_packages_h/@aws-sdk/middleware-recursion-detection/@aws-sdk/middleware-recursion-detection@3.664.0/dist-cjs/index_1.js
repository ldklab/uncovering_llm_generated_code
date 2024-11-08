"use strict";

const { HttpRequest } = require("@smithy/protocol-http");

const TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
const ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
const ENV_TRACE_ID = "_X_AMZN_TRACE_ID";

// Middleware to detect and handle recursion in Lambda functions
const recursionDetectionMiddleware = (options) => (next) => async (args) => {
  const { request } = args;

  if (
    !HttpRequest.isInstance(request) ||
    options.runtime !== "node" ||
    request.headers.hasOwnProperty(TRACE_ID_HEADER_NAME)
  ) {
    return next(args);
  }

  const functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
  const traceId = process.env[ENV_TRACE_ID];

  const nonEmptyString = (str) => typeof str === "string" && str.length > 0;

  if (nonEmptyString(functionName) && nonEmptyString(traceId)) {
    request.headers[TRACE_ID_HEADER_NAME] = traceId;
  }

  return next({
    ...args,
    request,
  });
};

// Options for adding the recursion detection middleware
const addRecursionDetectionMiddlewareOptions = {
  step: "build",
  tags: ["RECURSION_DETECTION"],
  name: "recursionDetectionMiddleware",
  override: true,
  priority: "low",
};

// Plugin to apply the recursion detection middleware to a client stack
const getRecursionDetectionPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(
      recursionDetectionMiddleware(options),
      addRecursionDetectionMiddlewareOptions
    );
  },
});

// Exports
module.exports = {
  recursionDetectionMiddleware,
  addRecursionDetectionMiddlewareOptions,
  getRecursionDetectionPlugin,
};
