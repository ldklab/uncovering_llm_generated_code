"use strict";
const { HttpRequest } = require("@smithy/protocol-http");

function resolveHostHeaderConfig(input) {
  return input; // Simply returns input as is.
}

const hostHeaderMiddleware = (options) => (next) => async (args) => {
  const { request } = args;

  // Check if the request is an instance of HttpRequest
  if (!HttpRequest.isInstance(request)) {
    return next(args);
  }

  const { handlerProtocol = "" } = options.requestHandler.metadata || {};

  // Adjust the host header based on HTTP protocol version
  if (handlerProtocol.includes("h2") && !request.headers[":authority"]) {
    delete request.headers["host"];
    request.headers[":authority"] = request.hostname + (request.port ? `:${request.port}` : "");
  } else if (!request.headers["host"]) {
    let host = request.hostname;
    if (request.port != null) {
      host += `:${request.port}`;
    }
    request.headers["host"] = host;
  }

  return next(args); // Proceed to the next middleware with adjusted headers
};

const hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};

const getHostHeaderPlugin = (options) => ({
  applyToStack: (clientStack) => {
    clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
  }
});

module.exports = {
  resolveHostHeaderConfig,
  hostHeaderMiddleware,
  hostHeaderMiddlewareOptions,
  getHostHeaderPlugin
};
