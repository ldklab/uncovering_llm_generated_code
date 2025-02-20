"use strict";
const { HttpRequest } = require("@smithy/protocol-http");

const TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
const ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
const ENV_TRACE_ID = "_X_AMZN_TRACE_ID";

// Middleware to add recursion detection header
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

  if (isNonEmptyString(functionName) && isNonEmptyString(traceId)) {
    request.headers[TRACE_ID_HEADER_NAME] = traceId;
  }

  return next({ ...args, request });
};

// Utility to check for non-empty strings
const isNonEmptyString = (str) => typeof str === "string" && str.length > 0;

// Options for adding the middleware to the stack
const addRecursionDetectionMiddlewareOptions = {
  step: "build",
  tags: ["RECURSION_DETECTION"],
  name: "recursionDetectionMiddleware",
  override: true,
  priority: "low",
};

// Plugin for adding the middleware
const getRecursionDetectionPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(recursionDetectionMiddleware(options), addRecursionDetectionMiddlewareOptions);
  },
});

// Exporting the functions for reuse
module.exports = {
  recursionDetectionMiddleware,
  addRecursionDetectionMiddlewareOptions,
  getRecursionDetectionPlugin
};
