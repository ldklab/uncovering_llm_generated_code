"use strict";
const { HttpRequest } = require("@smithy/protocol-http");

const TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
const ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
const ENV_TRACE_ID = "_X_AMZN_TRACE_ID";

function recursionDetectionMiddleware(options) {
  return (next) => async (args) => {
    const { request } = args;

    if (!HttpRequest.isInstance(request) || options.runtime !== "node" || request.headers.hasOwnProperty(TRACE_ID_HEADER_NAME)) {
      return next(args);
    }

    const functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
    const traceId = process.env[ENV_TRACE_ID];

    if (isNonEmptyString(functionName) && isNonEmptyString(traceId)) {
      request.headers[TRACE_ID_HEADER_NAME] = traceId;
    }

    return next({ ...args, request });
  };
}

function isNonEmptyString(str) {
  return typeof str === "string" && str.length > 0;
}

const addRecursionDetectionMiddlewareOptions = {
  step: "build",
  tags: ["RECURSION_DETECTION"],
  name: "recursionDetectionMiddleware",
  override: true,
  priority: "low"
};

function getRecursionDetectionPlugin(options) {
  return {
    applyToStack: (clientStack) => {
      clientStack.add(recursionDetectionMiddleware(options), addRecursionDetectionMiddlewareOptions);
    }
  };
}

module.exports = {
  recursionDetectionMiddleware,
  addRecursionDetectionMiddlewareOptions,
  getRecursionDetectionPlugin
};
