"use strict";
const { HttpRequest } = require("@aws-sdk/protocol-http");

function resolveHostHeaderConfig(input) {
  return input; // Simply returns the input configuration
}

const hostHeaderMiddleware = (options) => (next) => async (args) => {
  if (!HttpRequest.isInstance(args.request)) return next(args);

  const { request } = args;
  const { handlerProtocol = "" } = options.requestHandler.metadata || {};

  if (handlerProtocol.includes("h2") && !request.headers[":authority"]) {
    // For HTTP/2: Remove 'host' header, use ':authority'
    delete request.headers["host"];
    request.headers[":authority"] = "";
  } else if (!request.headers["host"]) {
    // For non-HTTP/2 or if 'host' header is absent: Set 'host' to hostname
    request.headers["host"] = request.hostname;
  }

  return next(args);
};

const hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
};

const getHostHeaderPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
  },
});

module.exports = {
  resolveHostHeaderConfig,
  hostHeaderMiddleware,
  hostHeaderMiddlewareOptions,
  getHostHeaderPlugin
};
