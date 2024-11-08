"use strict";

const { HttpRequest } = require("@smithy/protocol-http");

function resolveHostHeaderConfig(input) {
  return input;
}

function hostHeaderMiddleware(options) {
  return (next) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) return next(args);

    const { request } = args;
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
}

const hostHeaderMiddlewareOptions = {
  name: "hostHeaderMiddleware",
  step: "build",
  priority: "low",
  tags: ["HOST"],
  override: true
};

function getHostHeaderPlugin(options) {
  return {
    applyToStack: (clientStack) => {
      clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
    }
  };
}

module.exports = {
  resolveHostHeaderConfig,
  hostHeaderMiddleware,
  hostHeaderMiddlewareOptions,
  getHostHeaderPlugin
};
