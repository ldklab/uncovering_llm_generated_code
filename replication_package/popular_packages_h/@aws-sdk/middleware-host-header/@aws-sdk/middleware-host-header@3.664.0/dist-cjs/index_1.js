"use strict";

const { HttpRequest } = require("@smithy/protocol-http");

// Function to resolve provided host header configuration input
function resolveHostHeaderConfig(input) {
  return input;
}

// Middleware to handle and configure the host header in HTTP requests
function hostHeaderMiddleware(options) {
  return (next) => async (args) => {
    const { request } = args;
    
    if (!HttpRequest.isInstance(request)) {
      return next(args);
    }

    const { handlerProtocol = "" } = options.requestHandler.metadata || {};

    if (handlerProtocol.includes("h2") && !request.headers[":authority"]) {
      delete request.headers["host"];
      request.headers[":authority"] = `${request.hostname}${request.port ? `:${request.port}` : ""}`;
    } else if (!request.headers["host"]) {
      let host = request.hostname;
      if (request.port != null) {
        host += `:${request.port}`;
      }
      request.headers["host"] = host;
    }

    return next(args);
  };
}

// Options for the host header middleware used when adding to a client stack
const hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};

// Plugin to apply the host header middleware to a client stack
function getHostHeaderPlugin(options) {
  return {
    applyToStack: (clientStack) => {
      clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
    }
  };
}

// Exporting functions and middleware for external use
module.exports = {
  resolveHostHeaderConfig,
  hostHeaderMiddleware,
  hostHeaderMiddlewareOptions,
  getHostHeaderPlugin
};
