"use strict";
const { HttpRequest } = require("@aws-sdk/protocol-http");

function resolveHostHeaderConfig(input) {
    return input;
}

const hostHeaderMiddleware = (options) => (next) => async (args) => {
    const { request } = args;
    
    if (!HttpRequest.isInstance(request)) {
        return next(args);
    }

    const { handlerProtocol = "" } = options.requestHandler?.metadata || {};
    
    if (handlerProtocol.includes("h2") && !request.headers[":authority"]) {
        delete request.headers["host"];
        request.headers[":authority"] = "";
    } else if (!request.headers["host"]) {
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
    getHostHeaderPlugin,
};
