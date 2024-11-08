"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { HttpRequest } = require("@aws-sdk/protocol-http");

function resolveHostHeaderConfig(input) {
    return input;
}

const hostHeaderMiddleware = (options) => (next) => async (args) => {
    const { request } = args;
    if (!HttpRequest.isInstance(request)) {
        return next(args);
    }

    const handlerProtocol = options.requestHandler.metadata?.handlerProtocol || "";

    // For HTTP/2, prefer ':authority' over 'host'
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

exports.resolveHostHeaderConfig = resolveHostHeaderConfig;
exports.hostHeaderMiddleware = hostHeaderMiddleware;
exports.hostHeaderMiddlewareOptions = hostHeaderMiddlewareOptions;
exports.getHostHeaderPlugin = getHostHeaderPlugin;
