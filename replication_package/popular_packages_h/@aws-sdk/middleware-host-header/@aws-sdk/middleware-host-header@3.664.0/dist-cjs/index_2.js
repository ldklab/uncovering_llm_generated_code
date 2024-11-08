"use strict";
const { HttpRequest } = require("@smithy/protocol-http");

// Resolve host header config
function resolveHostHeaderConfig(input) {
  return input;
}

// Middleware to modify request headers
const hostHeaderMiddleware = (options) => (next) => async (args) => {
  const { request } = args;
  if (!HttpRequest.isInstance(request)) return next(args);

  const { handlerProtocol = "" } = options.requestHandler.metadata || {};
  
  if (handlerProtocol.includes("h2") && !request.headers[":authority"]) {
    delete request.headers["host"];
    request.headers[":authority"] = request.hostname + (request.port ? `:${request.port}` : "");
  } else if (!request.headers["host"]) {
    let host = request.hostname;
    if (request.port != null) host += `:${request.port}`;
    request.headers["host"] = host;
  }
  
  return next(args);
};

// Middleware options
const hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};

// Plugin to apply the middleware
const getHostHeaderPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
  }
});

// Exporting the functionality
module.exports = {
  resolveHostHeaderConfig,
  hostHeaderMiddleware,
  hostHeaderMiddlewareOptions,
  getHostHeaderPlugin
};
